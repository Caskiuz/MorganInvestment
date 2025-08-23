import mongoose from 'mongoose';

const TestimonioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  texto: { type: String, required: true },
  activa: { type: Boolean, default: true }
});

export default mongoose.model('Testimonio', TestimonioSchema);
