import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Reservation from '../models/Reservation.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware auth simple (reutilizaría, pero aquí inline para aislado)
router.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change');
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
});

// Obtener perfil
router.get('/me', async (req, res) => {
  const u = await User.findById(req.user.id).select('-passwordHash');
  res.json(u || {});
});

// Actualizar perfil
router.patch('/me', async (req, res) => {
  const allow = ['name','phone','preferredPaymentMethod'];
  const u = await User.findById(req.user.id);
  if (!u) return res.status(404).json({ error: 'No encontrado' });
  allow.forEach(f => { if (req.body[f] !== undefined) u[f] = req.body[f]; });
  await u.save();
  res.json({ ok: true });
});

// Cambiar contraseña
router.post('/me/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Faltan datos' });
  const u = await User.findById(req.user.id);
  if (!u) return res.status(404).json({ error: 'No encontrado' });
  const match = await bcrypt.compare(currentPassword, u.passwordHash);
  if (!match) return res.status(401).json({ error: 'Actual incorrecta' });
  u.passwordHash = await bcrypt.hash(newPassword, 10);
  await u.save();
  res.json({ ok: true });
});

// Mis reservas (filtrado por userId o email legacy)
router.get('/mis-reservas', async (req, res) => {
  const u = await User.findById(req.user.id);
  if (!u) return res.status(404).json({ error: 'No encontrado' });
  const list = await Reservation.find({ $or: [ { userId: u._id }, { email: u.email } ] }).sort({ createdAt: -1 }).limit(100);
  res.json(list);
});

// Cancelar una reserva del usuario (respetando ownership)
router.post('/mis-reservas/:id/cancel', async (req, res) => {
  const r = await Reservation.findById(req.params.id);
  if (!r) return res.status(404).json({ error: 'No encontrada' });
  if (r.userId && r.userId.toString() !== req.user.id && r.email !== req.user.email) return res.status(403).json({ error: 'Sin permiso' });
  if (r.status === 'cancelled') return res.json({ ok: true });
  r.status = 'cancelled';
  r.cancelledAt = new Date();
  await r.save();
  res.json({ ok: true });
});

export default router;