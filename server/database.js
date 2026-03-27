const mongoose = require('mongoose');

// URI de MongoDB - se configura via variable de entorno en Render
const MONGODB_URI = process.env.MONGODB_URI;

// Conectar a MongoDB
async function connectDatabase() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI no está configurado. Agrega la variable de entorno en Render.');
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    throw error;
  }
}

module.exports = { connectDatabase };
