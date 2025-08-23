
import express from 'express';
import Oferta from '../models/Oferta.js';
import Testimonio from '../models/Testimonio.js';
import Actividad from '../models/Actividad.js';
import Newsletter from '../models/Newsletter.js';

const router = express.Router();

// Agregar testimonio
router.post('/testimonios', async (req, res) => {
  const { nombre, texto } = req.body;
  if (!nombre || !texto) return res.status(400).json({ error: 'Nombre y texto requeridos' });
  try {
    await Testimonio.create({ nombre, texto });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar testimonio' });
  }
});

// Ofertas
router.get('/ofertas', async (req, res) => {
  const ofertas = await Oferta.find({ activa: true });
  res.json(ofertas);
});

// Testimonios
router.get('/testimonios', async (req, res) => {
  const testimonios = await Testimonio.find({ activa: true });
  res.json(testimonios);
});

// Actividades
router.get('/actividades', async (req, res) => {
  const actividades = await Actividad.find({ activa: true });
  res.json(actividades);
});

// Newsletter
router.post('/newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido' });
  try {
    const exists = await Newsletter.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Ya suscrito' });
    await Newsletter.create({ email });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al suscribir' });
  }
});

export default router;
