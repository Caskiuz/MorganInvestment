// Middleware simple para proteger rutas admin
// Usa la cabecera 'x-admin-secret' y la compara con la variable de entorno
import jwt from 'jsonwebtoken';

// Middleware admin: exige un token JWT en Authorization: Bearer <token>
// El token debe contener { role: 'admin' } en su payload.
export default function adminMiddleware(req, res, next) {
  const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change';

  const authHeader = req.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Se requiere token Bearer con rol admin' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload && payload.role === 'admin') {
      req.user = payload;
      return next();
    }
    return res.status(403).json({ error: 'Se requiere rol admin' });
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
