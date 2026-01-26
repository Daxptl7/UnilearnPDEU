import dotenv from 'dotenv';

dotenv.config();

export const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/unilearn'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expire: process.env.JWT_EXPIRE || '7d'
  },
  server: {
    port: process.env.PORT || 5010,
    env: process.env.NODE_ENV || 'development'
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173'
  }
};
