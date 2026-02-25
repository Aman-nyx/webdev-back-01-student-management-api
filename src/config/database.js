const mongoose = require('mongoose');

let connectionRetries = 0;
const MAX_RETRIES = 3;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/students', {
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    connectionRetries = 0;
    return conn;
  } catch (error) {
    connectionRetries++;
    if (connectionRetries >= MAX_RETRIES) {
      console.error('DB connection failed after retries');
      return null;
    }
    console.warn(`Retrying connection... (${connectionRetries}/${MAX_RETRIES})`);
    setTimeout(() => connectDB(), 2000);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected!');
  if (connectionRetries < MAX_RETRIES) {
    setTimeout(() => connectDB(), 5000);
  }
});

module.exports = connectDB;
