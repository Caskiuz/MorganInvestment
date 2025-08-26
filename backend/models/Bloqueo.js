import mongoose from 'mongoose';

const BloqueoSchema = new mongoose.Schema({
  alojamiento: { type: mongoose.Schema.Types.ObjectId, ref: 'Alojamiento', required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  motivo: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Bloqueo', BloqueoSchema);
