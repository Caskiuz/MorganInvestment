import express from 'express';
import Reservation from '../models/Reservation.js';

const router = express.Router();

// Crear reserva
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, alojamientoId, checkIn, checkOut, guests, extras, totalAmount } = req.body;
    if (!name || !email || !checkIn || !checkOut) return res.status(400).json({ error: 'Faltan datos' });

    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    if (ci >= co) return res.status(400).json({ error: 'Fechas inválidas' });

    // Aquí debería comprobar disponibilidad (por ahora simple)
    const reservation = new Reservation({ name, email, phone, alojamientoId, checkIn: ci, checkOut: co, guests, extras, totalAmount });
    await reservation.save();
    res.json({ ok: true, reservation });
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
