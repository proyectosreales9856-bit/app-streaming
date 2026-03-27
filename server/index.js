const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDatabase } = require('./database');

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

// Ruta de salud para Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Conectar a MongoDB y luego iniciar servidor
connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al iniciar servidor:', err.message);
    process.exit(1);
  });
