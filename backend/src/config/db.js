import mongoose from 'mongoose';
import { config } from './env.js';
import dns from 'dns';

// Fix for DNS resolution issues
try {
  dns.setServers(['8.8.8.8']);
} catch (error) {
  console.error('Could not set DNS servers:', error);
}

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
