import express from 'express';

const router = express.Router();

// Datos de ejemplo de alojamientos (demo)
const alojamientos = [
  { id: 'c1', name: 'Cabaña Familiar', price: 1200 },
  { id: 'c2', name: 'Suite Vista al Río', price: 1800 },
  { id: 'c3', name: 'Cabaña Pareja', price: 900 }
];

router.get('/', (req, res) => res.json(alojamientos));
router.get('/:id', (req, res) => {
  const a = alojamientos.find(x => x.id === req.params.id);
  if (!a) return res.status(404).json({ error: 'No encontrado' });
  res.json(a);
});

export default router;
