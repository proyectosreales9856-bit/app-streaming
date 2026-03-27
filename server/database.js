const mongoose = require('mongoose');

// URI de MongoDB - se puede configurar via variable de entorno
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/streaming';

// Conectar a MongoDB
async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
}

module.exports = { connectDatabase };
