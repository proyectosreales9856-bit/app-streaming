const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');

let db = null;

// Inicializar la base de datos
async function initDatabase() {
  const SQL = await initSqlJs();
  
  // Cargar base de datos existente o crear nueva
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Activar foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Crear tablas
  db.run(`
    CREATE TABLE IF NOT EXISTS tipos_cuenta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      precio_tienda REAL NOT NULL DEFAULT 0,
      precio_publico REAL NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS ventas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_orden INTEGER NOT NULL,
      tipo_cuenta_id INTEGER NOT NULL,
      precio_tienda REAL NOT NULL,
      precio_publico REAL NOT NULL,
      whatsapp TEXT NOT NULL,
      fecha_expiracion DATE NOT NULL,
      renovable BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tipo_cuenta_id) REFERENCES tipos_cuenta(id) ON DELETE CASCADE
    )
  `);

  // Guardar la base de datos
  saveDatabase();
  
  console.log('Base de datos SQLite inicializada');
  return db;
}

// Guardar la base de datos en disco
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Obtener la instancia de la base de datos
function getDb() {
  return db;
}

module.exports = {
  initDatabase,
  getDb,
  saveDatabase
};
