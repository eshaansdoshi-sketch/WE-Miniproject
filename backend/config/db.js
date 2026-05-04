const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/hirrd_db';
    const conn = await mongoose.connect(uri, {
      tls: true,
      tlsAllowInvalidCertificates: true,
    });
    console.log(`[MongoDB] Connected → ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
