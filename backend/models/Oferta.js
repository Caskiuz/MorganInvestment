import mongoose from 'mongoose';

const OfertaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  desc: { type: String, required: true },
  badge: { type: String },
  activa: { type: Boolean, default: true }
});

export default mongoose.model('Oferta', OfertaSchema);
