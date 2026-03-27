const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
  numero_orden: {
    type: Number,
    required: [true, 'El número de orden es requerido']
  },
  tipo_cuenta_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TiposCuenta',
    required: [true, 'El tipo de cuenta es requerido']
  },
  precio_tienda: {
    type: Number,
    required: true
  },
  precio_publico: {
    type: Number,
    required: true
  },
  whatsapp: {
    type: String,
    required: [true, 'El WhatsApp es requerido'],
    trim: true
  },
  fecha_expiracion: {
    type: Date,
    required: [true, 'La fecha de expiración es requerida']
  },
  renovable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Índice para ordenar por renovable y fecha de expiración
ventaSchema.index({ renovable: -1, fecha_expiracion: 1 });

module.exports = mongoose.model('Venta', ventaSchema);
