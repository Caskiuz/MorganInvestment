import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
// Modelos
import User from './models/User.js';
// Rutas
import publicDataRoutes from './routes/publicData.js';
import reservasRoutes from './routes/reservas.js';
import alojamientosRoutes from './routes/alojamientos.js';
import bloqueosRoutes from './routes/bloqueos.js';
import usersAdminRoutes from './routes/users.js';
import configRoutes from './routes/config.js';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change';

const app = express();

// Allow configuring the allowed origin from env (e.g. https://lascoloradasalpinas.com.mx)
// FRONTEND_ORIGIN puede estar configurado; en desarrollo permitir también localhost para evitar bloqueos CORS
let FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://morganinvestment-production.up.railway.app';
const DEV_ALLOWED = ['http://localhost:5173','http://localhost:5174','http://localhost:3000'];
const dynamicOrigin = (origin, callback) => {
  if (!origin) return callback(null, FRONTEND_ORIGIN); // SSR / same-origin
  if (origin === FRONTEND_ORIGIN || DEV_ALLOWED.includes(origin)) return callback(null, origin);
  return callback(new Error('CORS bloqueado para origen: ' + origin));
};

// CORS options: allow credentials and the common methods
const corsOptions = {
  origin: dynamicOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin','x-admin-secret']
};

// Apply CORS with explicit options and respond to preflight requests
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Ensure CORS headers are present even when errors happen
app.use((req, res, next) => {
  const reqOrigin = req.headers.origin;
  if (reqOrigin && (reqOrigin === FRONTEND_ORIGIN || DEV_ALLOWED.includes(reqOrigin))) {
    res.header('Access-Control-Allow-Origin', reqOrigin);
  } else {
    res.header('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  }
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
  res.header('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Seguridad y parsing
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false });
app.use('/api/', apiLimiter);
app.use(express.json());
// Servir archivos estáticos de uploads
app.use('/uploads', express.static(path.resolve('uploads')));
// Rutas públicas
app.use('/api/public', publicDataRoutes);
// Rutas funcionales
app.use('/api/reservas', reservasRoutes);
app.use('/api/alojamientos', alojamientosRoutes);
app.use('/api/bloqueos', bloqueosRoutes);
app.use('/api/users', usersAdminRoutes);
app.use('/api/config', configRoutes);

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

// Validar variables de entorno críticas
if (!MONGO_URI) {
  console.error('FATAL: MONGO_URI no definido. Revisa backend/.env o variables en el entorno.');
  process.exit(1);
}

// Conectar con opciones que controlan timeouts para obtener logs más claros
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 })
    .then(() => console.log('✅ Conexión a MongoDB (connect promise resolved)'))
    .catch(err => console.error('❌ Error inicial al conectar a MongoDB:', err));
} else {
  console.log('Modo test: la conexión a MongoDB será controlada por el suite de tests');
}

app.get('/', (req, res) => {
  res.send('API de Reservas Montemorelos funcionando');
});

app.get('/health', (_req, res) => {
  const status = {
    status: 'ok',
    uptime: process.uptime(),
    mongo: mongoose.connection.readyState // 1 connected
  };
  res.json(status);
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

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en puerto ${PORT}`);
  });
}

export default app;
