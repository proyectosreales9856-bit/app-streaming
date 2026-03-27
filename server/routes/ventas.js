const express = require('express');
const router = express.Router();
const { getDb, saveDatabase } = require('../database');

// Función helper para ejecutar queries SELECT
function queryAll(sql, params = []) {
  const db = getDb();
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    
    const rows = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      rows.push(row);
    }
    stmt.free();
    return rows;
  } catch (error) {
    return [];
  }
}

// Función helper para obtener un solo registro
function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// Obtener todas las ventas (ordenadas: renovables primero, luego por fecha de expiración)
router.get('/', (req, res) => {
  const sql = `
    SELECT v.*, tc.nombre as tipo_cuenta_nombre 
    FROM ventas v
    LEFT JOIN tipos_cuenta tc ON v.tipo_cuenta_id = tc.id
    ORDER BY v.renovable DESC, v.fecha_expiracion ASC
  `;
  const rows = queryAll(sql);
  res.json(rows);
});

// Obtener una venta por ID
router.get('/:id', (req, res) => {
  const sql = `
    SELECT v.*, tc.nombre as tipo_cuenta_nombre 
    FROM ventas v
    LEFT JOIN tipos_cuenta tc ON v.tipo_cuenta_id = tc.id
    WHERE v.id = ?
  `;
  const venta = queryOne(sql, [req.params.id]);
  
  if (!venta) {
    return res.status(404).json({ error: 'Venta no encontrada' });
  }
  
  res.json(venta);
});

// Crear una nueva venta
router.post('/', (req, res) => {
  const db = getDb();
  const { numero_orden, tipo_cuenta_id, precio_tienda, precio_publico, whatsapp, fecha_expiracion, renovable } = req.body;
  
  if (!numero_orden || !tipo_cuenta_id || !whatsapp || !fecha_expiracion) {
    return res.status(400).json({ error: 'Campos requeridos: numero_orden, tipo_cuenta_id, whatsapp, fecha_expiracion' });
  }

  try {
    // Verificar que el tipo de cuenta existe
    const tipoCuenta = queryOne('SELECT * FROM tipos_cuenta WHERE id = ?', [tipo_cuenta_id]);
    if (!tipoCuenta) {
      return res.status(400).json({ error: 'Tipo de cuenta no encontrado' });
    }

    const stmt = db.prepare(`
      INSERT INTO ventas (numero_orden, tipo_cuenta_id, precio_tienda, precio_publico, whatsapp, fecha_expiracion, renovable) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([
      numero_orden, 
      tipo_cuenta_id, 
      precio_tienda !== undefined ? precio_tienda : tipoCuenta.precio_tienda, 
      precio_publico !== undefined ? precio_publico : tipoCuenta.precio_publico, 
      whatsapp, 
      fecha_expiracion, 
      renovable ? 1 : 0
    ]);
    stmt.free();
    
    saveDatabase();
    
    // Obtener el ID insertado
    const idResult = queryOne('SELECT last_insert_rowid() as id');
    const newId = idResult.id;
    
    // Obtener la venta recién creada
    const selectSql = `
      SELECT v.*, tc.nombre as tipo_cuenta_nombre 
      FROM ventas v
      LEFT JOIN tipos_cuenta tc ON v.tipo_cuenta_id = tc.id
      WHERE v.id = ?
    `;
    const nuevaVenta = queryOne(selectSql, [newId]);
    
    res.status(201).json(nuevaVenta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar una venta
router.put('/:id', (req, res) => {
  const db = getDb();
  const { numero_orden, tipo_cuenta_id, precio_tienda, precio_publico, whatsapp, fecha_expiracion, renovable } = req.body;
  
  if (!numero_orden || !tipo_cuenta_id || !whatsapp || !fecha_expiracion) {
    return res.status(400).json({ error: 'Campos requeridos: numero_orden, tipo_cuenta_id, whatsapp, fecha_expiracion' });
  }

  try {
    // Verificar que la venta existe
    const existing = queryOne('SELECT * FROM ventas WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    // Verificar que el tipo de cuenta existe
    const tipoCuenta = queryOne('SELECT * FROM tipos_cuenta WHERE id = ?', [tipo_cuenta_id]);
    if (!tipoCuenta) {
      return res.status(400).json({ error: 'Tipo de cuenta no encontrado' });
    }

    const stmt = db.prepare(`
      UPDATE ventas 
      SET numero_orden = ?, tipo_cuenta_id = ?, precio_tienda = ?, precio_publico = ?, 
          whatsapp = ?, fecha_expiracion = ?, renovable = ?
      WHERE id = ?
    `);
    
    stmt.run([
      numero_orden, 
      tipo_cuenta_id, 
      precio_tienda || 0, 
      precio_publico || 0, 
      whatsapp, 
      fecha_expiracion, 
      renovable ? 1 : 0,
      req.params.id
    ]);
    stmt.free();
    
    saveDatabase();
    
    // Obtener la venta actualizada
    const selectSql = `
      SELECT v.*, tc.nombre as tipo_cuenta_nombre 
      FROM ventas v
      LEFT JOIN tipos_cuenta tc ON v.tipo_cuenta_id = tc.id
      WHERE v.id = ?
    `;
    const ventaActualizada = queryOne(selectSql, [req.params.id]);
    
    res.json(ventaActualizada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar una venta
router.delete('/:id', (req, res) => {
  const db = getDb();
  
  try {
    // Verificar que la venta existe
    const existing = queryOne('SELECT * FROM ventas WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    const stmt = db.prepare('DELETE FROM ventas WHERE id = ?');
    stmt.run([req.params.id]);
    stmt.free();
    
    saveDatabase();
    
    res.json({ message: 'Venta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
