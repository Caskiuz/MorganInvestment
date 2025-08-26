import express from 'express';
const router = express.Router();
import Bloqueo from '../models/Bloqueo.js';
import adminMiddleware from './_adminMiddleware.js';

// Obtener bloqueos de un alojamiento
router.get('/:alojamientoId', async (req, res) => {
  const { alojamientoId } = req.params;
  const bloqueos = await Bloqueo.find({ alojamiento: alojamientoId });
  res.json(bloqueos);
});

// Crear bloqueo
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { alojamiento, start, end, motivo } = req.body;
    if (!alojamiento || !start || !end) return res.status(400).json({ error: 'Faltan datos' });
    const bloqueo = await Bloqueo.create({ alojamiento, start, end, motivo });
    res.json(bloqueo);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Eliminar bloqueo
router.delete('/:id', adminMiddleware, async (req, res) => {
  await Bloqueo.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
