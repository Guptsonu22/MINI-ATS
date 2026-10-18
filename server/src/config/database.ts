import mongoose from 'mongoose';
import { env } from './environment.js';

let isConnecting = false;

export const connectDatabase = async (uri?: string): Promise<typeof mongoose> => {
  const targetUri = uri || (env.NODE_ENV === 'test' ? env.MONGODB_TEST_URI : env.MONGODB_URI);

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (isConnecting) {
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return mongoose;
  }

  isConnecting = true;

  try {
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });

    if (env.NODE_ENV !== 'test') {
      console.log(`🍃 Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    }

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  } finally {
    isConnecting = false;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    if (env.NODE_ENV !== 'test') {
      console.log('🍃 Disconnected from MongoDB');
    }
  }
};

export const getDatabaseStatus = (): {
  state: 'connected' | 'connecting' | 'disconnecting' | 'disconnected';
  host?: string;
  name?: string;
} => {
  const states: Record<number, 'disconnected' | 'connected' | 'connecting' | 'disconnecting'> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const state = states[mongoose.connection.readyState] || 'disconnected';

  return {
    state,
    ...(state === 'connected'
      ? {
          host: mongoose.connection.host,
          name: mongoose.connection.name,
        }
      : {}),
  };
};
