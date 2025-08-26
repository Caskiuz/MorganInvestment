// Middleware simple para proteger rutas admin
// Usa la cabecera 'x-admin-secret' y la compara con la variable de entorno
export default function adminMiddleware(req, res, next) {
  const ADMIN_SECRET = process.env.VITE_ADMIN_SECRET || process.env.ADMIN_SECRET || '';
  const provided = req.get('x-admin-secret');

  if (!ADMIN_SECRET) {
    console.error('ADMIN_SECRET no está configurado en el entorno');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  if (!provided || provided !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}
