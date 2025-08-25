import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import Reservation from '../models/Reservation.js';

dotenv.config();

const router = express.Router();
const stripeKey = process.env.STRIPE_SECRET_KEY || '';
let stripe = null;
if (stripeKey) {
  stripe = new Stripe(stripeKey, { apiVersion: '2023-08-16' });
} else {
  console.warn('STRIPE_SECRET_KEY no configurada - endpoints de pago no estarán disponibles');
}

// POST /api/payments/create-session
// body: { reservationId }
router.post('/create-session', async (req, res) => {
  const { reservationId } = req.body;
  if (!reservationId) return res.status(400).json({ error: 'reservationId required' });

  const reservation = await Reservation.findById(reservationId);
  if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

  if (!stripe) return res.status(501).json({ error: 'Stripe not configured. Set STRIPE_SECRET_KEY in env.' });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: `Reserva - ${reservation.alojamientoId}`,
              description: `Desde ${reservation.checkIn} hasta ${reservation.checkOut}`,
            },
            unit_amount: Math.round((reservation.totalAmount || 0) * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: reservation.email,
      success_url: (process.env.FRONTEND_ORIGIN || '') + '/?payment=success&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: (process.env.FRONTEND_ORIGIN || '') + '/?payment=cancel',
      metadata: {
        reservationId: reservation._id.toString(),
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe create session error', err);
    res.status(500).json({ error: 'Stripe error', details: err.message });
  }
});

// Webhook: stripe will send events here. We need raw body parsing in index.js
// For security, set STRIPE_WEBHOOK_SECRET in env for production.
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event = null;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } else {
      // Without secret, parse body directly (only for dev/test)
      event = req.body;
    }
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object;
    const reservationId = session.metadata?.reservationId;
    if (reservationId) {
      try {
        await Reservation.findByIdAndUpdate(reservationId, { status: 'confirmed', paid: true });
        console.log('Reservation confirmed via webhook:', reservationId);
      } catch (err) {
        console.error('Error updating reservation after payment', err);
      }
    }
  }

  res.json({ received: true });
});

export default router;
