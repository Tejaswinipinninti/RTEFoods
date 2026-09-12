const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rte_foods';

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
  };

  try {
    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log(`MongoDB Connected: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    });
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    console.error(`MongoDB Error: ${error.message}`);
    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Reconnecting in 3s...');
  cached.conn = null;
  cached.promise = null;
  setTimeout(() => {
    connectDB().catch((err) => console.error('Auto-reconnect failed:', err.message));
  }, 3000);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
  cached.conn = null;
  cached.promise = null;
});

module.exports = connectDB;
