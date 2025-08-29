import mongoose from 'mongoose';

const ConfigSchema = new mongoose.Schema({
  // Datos de contacto
  contactoEmail: { type: String, default: '' },
  telefono: { type: String, default: '' },
  direccion: { type: String, default: '' },
  // Datos de pago
  metodoPago: { type: String, default: '' }, // por ejemplo 'transferencia', 'paypal', 'stripe'
  pagoCuentaNombre: { type: String, default: '' },
  pagoCuentaNumero: { type: String, default: '' },
  pagoBanco: { type: String, default: '' },
  pagoClabe: { type: String, default: '' },
  // Políticas
  politicaCancelacion: { type: String, default: '' },
  politicaCheckIn: { type: String, default: '' },
  politicaCheckOut: { type: String, default: '' },
  // Otros campos dinámicos
  extra: { type: Map, of: String, default: {} }
}, { timestamps: true });

// Solo debe existir un documento; usaremos findOne + upsert

export default mongoose.model('Config', ConfigSchema);