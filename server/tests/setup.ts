import { beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { env } from '../src/config/environment.js';

beforeAll(async () => {
  // Enforce that we are running against an isolated test database
  const testDbUri = env.MONGODB_TEST_URI;

  if (!testDbUri.includes('test')) {
    throw new Error('Safety guard: Test database URI must contain "test" to prevent modifying real databases.');
  }

  await connectDatabase(testDbUri);

  // Clear test database collections before running tests
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    const collection = collections[key];
    if (collection) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  // Drop test database to clean up completely
  if (mongoose.connection.readyState === 1) {
    const dbName = mongoose.connection.name;
    if (dbName && dbName.includes('test')) {
      await mongoose.connection.dropDatabase();
    }
    await disconnectDatabase();
  }
});
