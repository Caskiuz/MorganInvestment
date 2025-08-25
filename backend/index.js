import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import User from './models/User.js';
import publicDataRoutes from './routes/publicData.js';
import reservasRoutes from './routes/reservas.js';
import alojamientosRoutes from './routes/alojamientos.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change';

const app = express();

// Allow configuring the allowed origin from env (e.g. https://lascoloradasalpinas.com.mx)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || process.env.VITE_API_URL || '*';

// CORS options: allow credentials and the common methods
const corsOptions = {
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin']
};

// Apply CORS with explicit options and respond to preflight requests
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Ensure CORS headers are present even when errors happen
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', corsOptions.origin);
  res.header('Access-Control-Allow-Credentials', String(!!corsOptions.credentials));
  res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
  next();
});

app.use(express.json());
app.use('/api/public', publicDataRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/alojamientos', alojamientosRoutes);

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/reservas';

mongoose.connection.on('connecting', () => {
  console.log('Intentando conectar a MongoDB...');
});
mongoose.connection.on('connected', () => {
  console.log('✅ Conexión a MongoDB establecida:', MONGO_URI);
});
mongoose.connection.on('error', (err) => {
  console.error('❌ Error de conexión a MongoDB:', err);
});
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  Desconectado de MongoDB');
});
mongoose.connection.on('reconnected', () => {
  console.log('🔄 Reconectado a MongoDB');
});
mongoose.connect(MONGO_URI);

app.get('/', (req, res) => {
  res.send('API de Reservas Montemorelos funcionando');
});

// Rutas de autenticación
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Faltan datos' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Usuario ya existe' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = new User({ name, email, passwordHash: hash });
    await user.save();
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Faltan datos' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Ruta protegida de ejemplo
app.get('/api/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  res.json({ user });
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});
