import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: { type: String },
  preferredPaymentMethod: { type: String, enum: ['manual','stripe','paypal'], default: 'manual' },
  stripeCustomerId: { type: String },
  paypalPayerId: { type: String }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
