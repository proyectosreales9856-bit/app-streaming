const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Importar rutas
const ventasRoutes = require('./routes/ventas');
const cuentasRoutes = require('./routes/cuentas');

// Usar rutas
app.use('/api/ventas', ventasRoutes);
app.use('/api/cuentas', cuentasRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Inicializar base de datos y luego iniciar servidor
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Error al inicializar la base de datos:', err);
  process.exit(1);
});
