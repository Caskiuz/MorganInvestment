import mongoose from 'mongoose';

const ReservationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  alojamientoId: { type: String },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, default: 2 },
  extras: [{ type: String }],
  totalAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['unpaid','processing','paid','failed'], default: 'unpaid' },
  paymentIntentId: { type: String },
  paymentReference: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Reservation', ReservationSchema);
