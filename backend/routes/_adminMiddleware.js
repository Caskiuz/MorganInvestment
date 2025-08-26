// Middleware simple para proteger rutas admin
// Usa la cabecera 'x-admin-secret' y la compara con la variable de entorno
export default function adminMiddleware(req, res, next) {
  const ADMIN_SECRET = process.env.VITE_ADMIN_SECRET || process.env.ADMIN_SECRET || '';
  const provided = req.get('x-admin-secret');

  // Si no hay ADMIN_SECRET configurado, permitimos la petición pero advertimos.
  // Esto facilita ejecutar la app sin configuración de secretos en entornos de prueba
  // o cuando el usuario solicita que se 'elimne' la protección. En producción
  // es recomendable establecer un ADMIN_SECRET o migrar a roles/JWT.
  if (!ADMIN_SECRET) {
    console.warn('ADMIN_SECRET no configurado - rutas admin sin protección (usar solo para pruebas)');
    return next();
  }

  if (!provided || provided !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}
