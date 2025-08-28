const mongoose = require('mongoose');

module.exports = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected:', conn.connection.name);
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
};
