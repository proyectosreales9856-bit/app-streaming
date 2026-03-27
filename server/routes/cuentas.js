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

// Obtener todos los tipos de cuenta
router.get('/', (req, res) => {
  const rows = queryAll('SELECT * FROM tipos_cuenta ORDER BY nombre');
  res.json(rows);
});

// Obtener un tipo de cuenta por ID
router.get('/:id', (req, res) => {
  const row = queryOne('SELECT * FROM tipos_cuenta WHERE id = ?', [req.params.id]);
  
  if (!row) {
    return res.status(404).json({ error: 'Tipo de cuenta no encontrado' });
  }
  
  res.json(row);
});

// Crear un nuevo tipo de cuenta
router.post('/', (req, res) => {
  const db = getDb();
  const { nombre, precio_tienda, precio_publico } = req.body;
  
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }

  try {
    const stmt = db.prepare(
      'INSERT INTO tipos_cuenta (nombre, precio_tienda, precio_publico) VALUES (?, ?, ?)'
    );
    stmt.run([nombre, precio_tienda || 0, precio_publico || 0]);
    stmt.free();
    
    saveDatabase();
    
    // Obtener el ID insertado
    const idResult = queryOne('SELECT last_insert_rowid() as id');
    const newId = idResult.id;
    
    // Obtener la cuenta recién creada
    const nuevaCuenta = queryOne('SELECT * FROM tipos_cuenta WHERE id = ?', [newId]);
    
    res.status(201).json(nuevaCuenta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un tipo de cuenta
router.put('/:id', (req, res) => {
  const db = getDb();
  const { nombre, precio_tienda, precio_publico } = req.body;
  
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }

  try {
    // Verificar que existe
    const existing = queryOne('SELECT * FROM tipos_cuenta WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Tipo de cuenta no encontrado' });
    }

    const stmt = db.prepare(
      'UPDATE tipos_cuenta SET nombre = ?, precio_tienda = ?, precio_publico = ? WHERE id = ?'
    );
    stmt.run([nombre, precio_tienda || 0, precio_publico || 0, req.params.id]);
    stmt.free();
    
    saveDatabase();
    
    // Obtener la cuenta actualizada
    const cuentaActualizada = queryOne('SELECT * FROM tipos_cuenta WHERE id = ?', [req.params.id]);
    
    res.json(cuentaActualizada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un tipo de cuenta
router.delete('/:id', (req, res) => {
  const db = getDb();
  
  try {
    // Verificar que existe
    const existing = queryOne('SELECT * FROM tipos_cuenta WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Tipo de cuenta no encontrado' });
    }

    // Verificar si hay ventas asociadas
    const ventasCount = queryOne('SELECT COUNT(*) as count FROM ventas WHERE tipo_cuenta_id = ?', [req.params.id]);
    
    if (ventasCount.count > 0) {
      return res.status(400).json({ error: 'No se puede eliminar: hay ventas asociadas a este tipo de cuenta' });
    }

    const stmt = db.prepare('DELETE FROM tipos_cuenta WHERE id = ?');
    stmt.run([req.params.id]);
    stmt.free();
    
    saveDatabase();
    
    res.json({ message: 'Tipo de cuenta eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
