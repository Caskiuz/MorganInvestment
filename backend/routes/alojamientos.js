import express from 'express';
import Alojamiento from '../models/Alojamiento.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import adminMiddleware from './_adminMiddleware.js';

const router = express.Router();

// Configuración de multer para uploads locales
const uploadDir = path.resolve('uploads/alojamientos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random()*1e6) + ext);
  }
});
const upload = multer({ storage });

// Usamos el middleware centralizado en _adminMiddleware.js

// GET todos
router.get('/', async (req, res) => {
  const list = await Alojamiento.find().sort({ createdAt: -1 });
  res.json(list);
});

// GET uno
router.get('/:id', async (req, res) => {
  const a = await Alojamiento.findById(req.params.id);
  if (!a) return res.status(404).json({ error: 'No encontrado' });
  res.json(a);
});

// POST crear
router.post('/', adminMiddleware, upload.array('images', 6), async (req, res) => {
  try {
    const { name, description, price, capacity, extras } = req.body;
    const images = req.files ? req.files.map(f => '/uploads/alojamientos/' + f.filename) : [];
    const alojamiento = new Alojamiento({ name, description, price, capacity, extras: extras ? extras.split(',') : [], images });
    await alojamiento.save();
    res.json({ ok: true, alojamiento });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT editar
router.put('/:id', adminMiddleware, upload.array('images', 6), async (req, res) => {
  try {
    const { name, description, price, capacity, extras } = req.body;
    const alojamiento = await Alojamiento.findById(req.params.id);
    if (!alojamiento) return res.status(404).json({ error: 'No encontrado' });
    alojamiento.name = name;
    alojamiento.description = description;
    alojamiento.price = price;
    alojamiento.capacity = capacity;
    alojamiento.extras = extras ? extras.split(',') : [];
    if (req.files && req.files.length) {
      alojamiento.images = req.files.map(f => '/uploads/alojamientos/' + f.filename);
    }
    await alojamiento.save();
    res.json({ ok: true, alojamiento });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const alojamiento = await Alojamiento.findByIdAndDelete(req.params.id);
    if (!alojamiento) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
