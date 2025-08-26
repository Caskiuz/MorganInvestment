// Middleware simple para proteger rutas admin
// Usa la cabecera 'x-admin-secret' y la compara con la variable de entorno
import jwt from 'jsonwebtoken';

// Middleware admin que acepta dos formas de autenticación:
// 1) Bearer <token> con JWT que contiene { role: 'admin' }
// 2) Cabecera 'x-admin-secret' cuando ADMIN_SECRET está configurado (fallback)
export default function adminMiddleware(req, res, next) {
  const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change';
  const ADMIN_SECRET = process.env.VITE_ADMIN_SECRET || process.env.ADMIN_SECRET || '';

  // 1) Intentar autorizar vía JWT Bearer
  const authHeader = req.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
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

  // 2) Fallback: validar x-admin-secret si ADMIN_SECRET está configurado
  const provided = req.get('x-admin-secret') || req.query.admin_secret;
  if (ADMIN_SECRET) {
    if (!provided || provided !== ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // permitir si coincide
    return next();
  }

  // Si no hay ADMIN_SECRET y no hay Bearer token, permitimos con advertencia (dev/legacy)
  console.warn('ADMIN_SECRET no configurado y no se proporcionó Bearer token - rutas admin sin protección (usar solo para pruebas)');
  return next();
}
