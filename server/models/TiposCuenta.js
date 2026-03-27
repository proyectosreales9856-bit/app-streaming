const mongoose = require('mongoose');

const tiposCuentaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  precio_tienda: {
    type: Number,
    required: true,
    default: 0
  },
  precio_publico: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('TiposCuenta', tiposCuentaSchema);
