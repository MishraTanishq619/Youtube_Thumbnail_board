import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

// Maintain a global mongoose connection promise across hot reloads for development.
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

// declare global {
//   var mongoose: {
//     conn: typeof mongoose | null;
//     promise: Promise<typeof mongoose> | null;
//   };
// }

// @ts-expect-error Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.
let cached = global.mongoose;

if (!cached) {
  // @ts-expect-error Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.
  cached = global.mongoose = { conn: null, promise: null };
}

const connectMongo = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectMongo;
