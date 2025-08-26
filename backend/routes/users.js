import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Middleware admin reutilizando ADMIN_SECRET
const adminMiddleware = (req, res, next) => {
  const secret = req.headers['x-admin-secret'] || req.query.admin_secret;
  if (!secret || secret !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'No autorizado (admin)' });
  next();
};

const router = express.Router();

// Listar usuarios (solo admin)
router.get('/', adminMiddleware, async (req, res) => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 }).limit(500);
  res.json(users);
});

// Crear usuario (admin)
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Faltan datos' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email ya registrado' });
    const hash = await bcrypt.hash(password, 10);
    const u = new User({ name, email, passwordHash: hash, role: role === 'admin' ? 'admin' : 'user' });
    await u.save();
    res.json({ ok: true, user: { id: u._id, name: u.name, email: u.email, role: u.role } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Actualizar usuario (admin)
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'No encontrado' });
    if (name) u.name = name;
    if (email) u.email = email;
    if (password) u.passwordHash = await bcrypt.hash(password, 10);
    if (role) u.role = role === 'admin' ? 'admin' : 'user';
    await u.save();
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Eliminar usuario (admin)
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
