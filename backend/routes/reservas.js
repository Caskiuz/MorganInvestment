import express from 'express';
import Reservation from '../models/Reservation.js';

// Helper para comprobar solapamiento de fechas
function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return (aStart < bEnd) && (bStart < aEnd);
}

const router = express.Router();

// Crear reserva
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, alojamientoId, checkIn, checkOut, guests, extras, totalAmount } = req.body;
    if (!name || !email || !checkIn || !checkOut) return res.status(400).json({ error: 'Faltan datos' });

    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    if (ci >= co) return res.status(400).json({ error: 'Fechas inválidas' });

    // Comprobar disponibilidad: buscar reservas que solapen
    const conflicts = await Reservation.find({ alojamientoId, status: { $in: ['pending','confirmed'] },
      $or: [
        { $and: [ { checkIn: { $lte: co } }, { checkOut: { $gt: ci } } ] }
      ]
    });
    if (conflicts && conflicts.length > 0) {
      return res.status(409).json({ error: 'Fechas no disponibles', conflicts });
    }

    // Crear reserva — marcamos como 'pending' hasta confirmación manual o pago
    const reservation = new Reservation({ name, email, phone, alojamientoId, checkIn: ci, checkOut: co, guests, extras, totalAmount, status: 'pending' });
    await reservation.save();
    res.json({ ok: true, reservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Middleware simple para admin: usa HEADER ADMIN_SECRET (configurar en env)
const adminMiddleware = (req, res, next) => {
  const secret = req.headers['x-admin-secret'] || req.query.admin_secret;
  if (!secret || secret !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'No autorizado (admin)' });
  next();
};

// Confirmar reserva (admin)
router.patch('/:id/confirm', adminMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const r = await Reservation.findById(id);
    if (!r) return res.status(404).json({ error: 'Reserva no encontrada' });
    r.status = 'confirmed';
    await r.save();
    res.json({ ok: true, reservation: r });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Cancelar reserva (admin)
router.patch('/:id/cancel', adminMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const r = await Reservation.findById(id);
    if (!r) return res.status(404).json({ error: 'Reserva no encontrada' });
    r.status = 'cancelled';
    await r.save();
    res.json({ ok: true, reservation: r });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Comprobar disponibilidad (POST body: alojamientoId, checkIn, checkOut)
router.post('/check', async (req, res) => {
  try {
    const { alojamientoId, checkIn, checkOut } = req.body;
    if (!alojamientoId || !checkIn || !checkOut) return res.status(400).json({ error: 'Faltan datos' });
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    if (ci >= co) return res.status(400).json({ error: 'Fechas inválidas' });

    const conflicts = await Reservation.find({ alojamientoId, status: { $in: ['pending','confirmed'] },
      $or: [
        { $and: [ { checkIn: { $lte: co } }, { checkOut: { $gt: ci } } ] }
      ]
    });
    if (conflicts && conflicts.length > 0) return res.json({ available: false, conflicts });
    return res.json({ available: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Listar reservas (simple)
router.get('/', async (req, res) => {
  try {
    const list = await Reservation.find().sort({ createdAt: -1 }).limit(200);
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

export default router;
