const mongoose = require('mongoose');

// Use a global variable to store the connection promise to avoid redundant connections in serverless environments
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!process.env.MONGO_URI) {
    const error = new Error('MONGO_URI is missing in environment variables. Please check Vercel dashboard settings.');
    console.error(error.message);
    throw error;
  }

  try {
    console.log(`Connecting to MongoDB... (URI exists: ${!!process.env.MONGO_URI})`);
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, 
    });
    
    cachedConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
