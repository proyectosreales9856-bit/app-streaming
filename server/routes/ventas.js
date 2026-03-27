const express = require('express');
const router = express.Router();
const Venta = require('../models/Venta');
const TiposCuenta = require('../models/TiposCuenta');

// Obtener todas las ventas (ordenadas: renovables primero, luego por fecha de expiración)
router.get('/', async (req, res) => {
  try {
    const ventas = await Venta.find()
      .populate('tipo_cuenta_id', 'nombre')
      .sort({ renovable: -1, fecha_expiracion: 1 });
    
    // Transformar el resultado para incluir tipo_cuenta_nombre
    const ventasFormateadas = ventas.map(venta => {
      const obj = venta.toObject();
      obj.tipo_cuenta_nombre = venta.tipo_cuenta_id ? venta.tipo_cuenta_id.nombre : 'N/A';
      obj.tipo_cuenta_id = venta.tipo_cuenta_id ? venta.tipo_cuenta_id._id : null;
      return obj;
    });
    
    res.json(ventasFormateadas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una venta por ID
router.get('/:id', async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
      .populate('tipo_cuenta_id', 'nombre');
    
    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    
    const obj = venta.toObject();
    obj.tipo_cuenta_nombre = venta.tipo_cuenta_id ? venta.tipo_cuenta_id.nombre : 'N/A';
    obj.tipo_cuenta_id = venta.tipo_cuenta_id ? venta.tipo_cuenta_id._id : null;
    
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear una nueva venta
router.post('/', async (req, res) => {
  try {
    const { numero_orden, tipo_cuenta_id, precio_tienda, precio_publico, whatsapp, fecha_expiracion, renovable } = req.body;
    
    if (!numero_orden || !tipo_cuenta_id || !whatsapp || !fecha_expiracion) {
      return res.status(400).json({ error: 'Campos requeridos: numero_orden, tipo_cuenta_id, whatsapp, fecha_expiracion' });
    }

    // Verificar que el tipo de cuenta existe
    const tipoCuenta = await TiposCuenta.findById(tipo_cuenta_id);
    if (!tipoCuenta) {
      return res.status(400).json({ error: 'Tipo de cuenta no encontrado' });
    }

    const nuevaVenta = new Venta({
      numero_orden,
      tipo_cuenta_id,
      precio_tienda: precio_tienda !== undefined ? precio_tienda : tipoCuenta.precio_tienda,
      precio_publico: precio_publico !== undefined ? precio_publico : tipoCuenta.precio_publico,
      whatsapp,
      fecha_expiracion,
      renovable: renovable !== undefined ? renovable : true
    });

    await nuevaVenta.save();
    
    // Populate para devolver con nombre
    await nuevaVenta.populate('tipo_cuenta_id', 'nombre');
    
    const obj = nuevaVenta.toObject();
    obj.tipo_cuenta_nombre = nuevaVenta.tipo_cuenta_id ? nuevaVenta.tipo_cuenta_id.nombre : 'N/A';
    obj.tipo_cuenta_id = nuevaVenta.tipo_cuenta_id ? nuevaVenta.tipo_cuenta_id._id : null;
    
    res.status(201).json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar una venta
router.put('/:id', async (req, res) => {
  try {
    const { numero_orden, tipo_cuenta_id, precio_tienda, precio_publico, whatsapp, fecha_expiracion, renovable } = req.body;
    
    if (!numero_orden || !tipo_cuenta_id || !whatsapp || !fecha_expiracion) {
      return res.status(400).json({ error: 'Campos requeridos: numero_orden, tipo_cuenta_id, whatsapp, fecha_expiracion' });
    }

    // Verificar que el tipo de cuenta existe
    const tipoCuenta = await TiposCuenta.findById(tipo_cuenta_id);
    if (!tipoCuenta) {
      return res.status(400).json({ error: 'Tipo de cuenta no encontrado' });
    }

    const venta = await Venta.findByIdAndUpdate(
      req.params.id,
      {
        numero_orden,
        tipo_cuenta_id,
        precio_tienda: precio_tienda || 0,
        precio_publico: precio_publico || 0,
        whatsapp,
        fecha_expiracion,
        renovable: renovable !== undefined ? renovable : true
      },
      { new: true, runValidators: true }
    ).populate('tipo_cuenta_id', 'nombre');

    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    const obj = venta.toObject();
    obj.tipo_cuenta_nombre = venta.tipo_cuenta_id ? venta.tipo_cuenta_id.nombre : 'N/A';
    obj.tipo_cuenta_id = venta.tipo_cuenta_id ? venta.tipo_cuenta_id._id : null;

    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar una venta
router.delete('/:id', async (req, res) => {
  try {
    const venta = await Venta.findByIdAndDelete(req.params.id);
    
    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.json({ message: 'Venta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
