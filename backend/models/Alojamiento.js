import mongoose from 'mongoose';

const alojamientoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  images: [{ type: String }], // rutas locales
  capacity: { type: Number, default: 2 },
  extras: [{ type: String }],
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Alojamiento', alojamientoSchema);
