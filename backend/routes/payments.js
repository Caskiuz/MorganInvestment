import express from 'express';
import Config from '../models/Config.js';
import Reservation from '../models/Reservation.js';
import adminMiddleware from './_adminMiddleware.js';
import Stripe from 'stripe';
import paypal from '@paypal/checkout-server-sdk';
import { sendReservationEmail, buildPaidEmail } from '../utils/email.js';

const router = express.Router();

// Crear PaymentIntent / Checkout Session para una reserva existente (pendiente)
router.post('/create-checkout-session', async (req, res) => {
	try {
		const { reservationId } = req.body;
		if (!reservationId) return res.status(400).json({ error: 'reservationId requerido' });
		const reservation = await Reservation.findById(reservationId);
		if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada' });
		if (reservation.paymentStatus === 'paid') return res.status(400).json({ error: 'Reserva ya pagada' });
		const cfg = await Config.findOne();
		if (!cfg || cfg.metodoPago !== 'stripe') return res.status(400).json({ error: 'Stripe no configurado' });
		if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Falta STRIPE_SECRET_KEY' });
		const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
		const amountCents = Math.round((reservation.totalAmount || 0) * 100);
		if (amountCents <= 0) return res.status(400).json({ error: 'Monto inválido' });
		const session = await stripe.checkout.sessions.create({
			mode: 'payment',
			payment_method_types: ['card'],
			line_items: [{
				price_data: {
					currency: 'mxn',
					product_data: { name: `Reserva ${reservation._id}` },
					unit_amount: amountCents
				},
				quantity: 1
			}],
			success_url: (process.env.FRONTEND_ORIGIN || 'http://localhost:5173') + '/?pago=ok&res=' + reservation._id,
			cancel_url: (process.env.FRONTEND_ORIGIN || 'http://localhost:5173') + '/?pago=cancel&res=' + reservation._id,
			metadata: { reservationId: reservation._id.toString() }
		});
		reservation.paymentStatus = 'processing';
		await reservation.save();
		res.json({ id: session.id, url: session.url });
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: 'Error creando sesión de pago' });
	}
});

// Webhook Stripe para actualizar estado (configurar endpoint en Stripe dashboard)
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
	const sig = req.headers['stripe-signature'];
	const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
	let event;
	try {
		const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
		if (endpointSecret) {
			event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
		} else {
			event = JSON.parse(req.body);
		}
	} catch (err) {
		console.error('Webhook error', err.message);
		return res.status(400).send(`Webhook Error: ${err.message}`);
	}
	if (event.type === 'checkout.session.completed') {
		const session = event.data.object;
		const reservationId = session.metadata?.reservationId;
		if (reservationId) {
			const r = await Reservation.findByIdAndUpdate(reservationId, { paymentStatus: 'paid', status: 'confirmed', paidAt: new Date() }, { new: true });
			if (r) {
				try { await sendReservationEmail(r.email, 'Pago confirmado', buildPaidEmail(r)); } catch(e){ console.error('Email error', e); }
			}
		}
	} else if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
		const session = event.data.object;
		const reservationId = session.metadata?.reservationId;
		if (reservationId) {
			await Reservation.findByIdAndUpdate(reservationId, { paymentStatus: 'failed' });
		}
	}
	res.json({ received: true });
});

// Crear orden PayPal (Checkout) para reserva
router.post('/paypal/create-order', async (req, res) => {
	try {
		const { reservationId } = req.body;
		if (!reservationId) return res.status(400).json({ error: 'reservationId requerido' });
		const reservation = await Reservation.findById(reservationId);
		if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada' });
		const cfg = await Config.findOne();
		if (!cfg || cfg.metodoPago !== 'paypal') return res.status(400).json({ error: 'PayPal no configurado' });
		if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) return res.status(500).json({ error: 'Credenciales PayPal faltan' });

		const environment = process.env.PAYPAL_MODE === 'live'
			? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
			: new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
		const client = new paypal.core.PayPalHttpClient(environment);

		const request = new paypal.orders.OrdersCreateRequest();
		request.prefer('return=representation');
		request.requestBody({
			intent: 'CAPTURE',
			purchase_units: [{
				reference_id: reservation._id.toString(),
				amount: { currency_code: 'MXN', value: (reservation.totalAmount || 0).toFixed(2) }
			}],
			application_context: {
				return_url: (process.env.FRONTEND_ORIGIN || 'http://localhost:5173') + '/?pago=ok&res=' + reservation._id,
				cancel_url: (process.env.FRONTEND_ORIGIN || 'http://localhost:5173') + '/?pago=cancel&res=' + reservation._id
			}
		});
		const order = await client.execute(request);
		reservation.paymentStatus = 'processing';
		reservation.paymentReference = order.result.id;
		await reservation.save();
		res.json({ id: order.result.id, links: order.result.links });
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: 'Error creando orden PayPal' });
	}
});

// Capturar orden PayPal después del approval
router.post('/paypal/capture', async (req, res) => {
	try {
		const { orderId } = req.body;
		if (!orderId) return res.status(400).json({ error: 'orderId requerido' });
		const environment = process.env.PAYPAL_MODE === 'live'
			? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
			: new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
		const client = new paypal.core.PayPalHttpClient(environment);
		const request = new paypal.orders.OrdersCaptureRequest(orderId);
		request.requestBody({});
		const capture = await client.execute(request);
		const reference = capture.result.purchase_units?.[0]?.reference_id;
		if (capture.result.status === 'COMPLETED' && reference) {
			const r = await Reservation.findByIdAndUpdate(reference, { paymentStatus: 'paid', status: 'confirmed', paidAt: new Date() }, { new: true });
			if (r) { try { await sendReservationEmail(r.email, 'Pago confirmado', buildPaidEmail(r)); } catch(e){ console.error('Email error', e); } }
		}
		res.json({ ok: true, capture: capture.result });
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: 'Error capturando orden PayPal' });
	}
});

// Admin: listar pagos en proceso (reservas no pagadas)
router.get('/pending', adminMiddleware, async (_req, res) => {
	const list = await Reservation.find({ paymentStatus: { $in: ['unpaid','processing'] } }).sort({ createdAt: -1 }).limit(100);
	res.json(list);
});

export default router;
