import mongoose from 'mongoose';

const ActividadSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  desc: { type: String, required: true },
  icon: { type: String },
  activa: { type: Boolean, default: true }
});

export default mongoose.model('Actividad', ActividadSchema);
