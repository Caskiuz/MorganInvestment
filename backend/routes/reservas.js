import express from 'express';
import Reservation from '../models/Reservation.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper para comprobar solapamiento de fechas
function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return (aStart < bEnd) && (bStart < aEnd);
}

const router = express.Router();

// Middleware auth opcional (no bloquea si no hay token)
function optionalAuth(req, _res, next) {
  const auth = req.headers.authorization;
  if (auth) {
    const token = auth.split(' ')[1];
    try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change'); } catch {}
  }
  next();
}

// Crear reserva
router.post('/', optionalAuth, async (req, res) => {
  try {
  const { name, email, phone, alojamientoId, checkIn, checkOut, guests, extras, totalAmount } = req.body;
  if (!name || !checkIn || !checkOut) return res.status(400).json({ error: 'Faltan datos' });

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
    let finalEmail = email;
    let userId = undefined;
    if (req.user) {
      const u = await User.findById(req.user.id);
      if (u) { finalEmail = u.email; userId = u._id; }
    }
    const reservation = new Reservation({ name, email: finalEmail, phone, alojamientoId, checkIn: ci, checkOut: co, guests, extras, totalAmount, status: 'pending', userId });
    await reservation.save();
    res.json({ ok: true, reservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

import adminMiddleware from './_adminMiddleware.js';
import Config from '../models/Config.js';

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
    const cfg = await Config.findOne();
    const horas = cfg?.cancelacionHorasAnticipacion ?? 48;
    const now = new Date();
    if (r.checkIn && (r.checkIn - now) < horas*60*60*1000) {
      // admin podría forzar; por ahora permitir si query ?force=1
      if (!req.query.force) return res.status(400).json({ error: 'Fuera de ventana de cancelación. Añade ?force=1 para forzar.' });
    }
    r.status = 'cancelled';
    r.cancelledAt = new Date();
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
