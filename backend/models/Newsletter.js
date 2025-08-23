import mongoose from 'mongoose';

const NewsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  fecha: { type: Date, default: Date.now }
});

export default mongoose.model('Newsletter', NewsletterSchema);
