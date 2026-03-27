const express = require('express');
const router = express.Router();
const TiposCuenta = require('../models/TiposCuenta');
const Venta = require('../models/Venta');

// Obtener todos los tipos de cuenta
router.get('/', async (req, res) => {
  try {
    const cuentas = await TiposCuenta.find().sort({ nombre: 1 });
    res.json(cuentas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un tipo de cuenta por ID
router.get('/:id', async (req, res) => {
  try {
    const cuenta = await TiposCuenta.findById(req.params.id);
    if (!cuenta) {
      return res.status(404).json({ error: 'Tipo de cuenta no encontrado' });
    }
    res.json(cuenta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo tipo de cuenta
router.post('/', async (req, res) => {
  try {
    const { nombre, precio_tienda, precio_publico } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const nuevaCuenta = new TiposCuenta({
      nombre,
      precio_tienda: precio_tienda || 0,
      precio_publico: precio_publico || 0
    });

    await nuevaCuenta.save();
    res.status(201).json(nuevaCuenta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un tipo de cuenta
router.put('/:id', async (req, res) => {
  try {
    const { nombre, precio_tienda, precio_publico } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const cuenta = await TiposCuenta.findByIdAndUpdate(
      req.params.id,
      { nombre, precio_tienda: precio_tienda || 0, precio_publico: precio_publico || 0 },
      { new: true, runValidators: true }
    );

    if (!cuenta) {
      return res.status(404).json({ error: 'Tipo de cuenta no encontrado' });
    }

    res.json(cuenta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un tipo de cuenta
router.delete('/:id', async (req, res) => {
  try {
    const cuenta = await TiposCuenta.findById(req.params.id);
    if (!cuenta) {
      return res.status(404).json({ error: 'Tipo de cuenta no encontrado' });
    }

    // Verificar si hay ventas asociadas
    const ventasAsociadas = await Venta.countDocuments({ tipo_cuenta_id: req.params.id });
    if (ventasAsociadas > 0) {
      return res.status(400).json({ error: 'No se puede eliminar: hay ventas asociadas a este tipo de cuenta' });
    }

    await TiposCuenta.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tipo de cuenta eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
