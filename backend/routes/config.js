import express from 'express';
import Config from '../models/Config.js';
import adminMiddleware from './_adminMiddleware.js';

const router = express.Router();

// Obtener configuración pública (solo campos no sensibles)
router.get('/public', async (_req, res) => {
  try {
    const cfg = await Config.findOne() || {};
    const publicFields = (({ contactoEmail, telefono, direccion, politicaCancelacion, politicaCheckIn, politicaCheckOut }) => ({ contactoEmail, telefono, direccion, politicaCancelacion, politicaCheckIn, politicaCheckOut }))(cfg.toObject ? cfg.toObject() : cfg);
    res.json(publicFields);
  } catch (e) { res.status(500).json({ error: 'Error obteniendo configuración' }); }
});

// Obtener configuración completa (admin)
router.get('/', adminMiddleware, async (_req, res) => {
  try {
    const cfg = await Config.findOne();
    res.json(cfg || {});
  } catch (e) { res.status(500).json({ error: 'Error' }); }
});

// Actualizar / crear configuración (admin)
router.put('/', adminMiddleware, async (req, res) => {
  try {
    const update = req.body || {};
    const cfg = await Config.findOneAndUpdate({}, update, { new: true, upsert: true, setDefaultsOnInsert: true });
    res.json(cfg);
  } catch (e) { res.status(500).json({ error: 'Error guardando configuración' }); }
});

export default router;