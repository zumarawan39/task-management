import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalCache = globalThis as typeof globalThis & { mongooseCache?: MongooseCache };
const cached: MongooseCache = globalCache.mongooseCache ?? { conn: null, promise: null };
globalCache.mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
