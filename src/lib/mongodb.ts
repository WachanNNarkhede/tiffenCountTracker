import mongoose from "mongoose";

// Primary connection string (Atlas or whatever you set in .env / .env.local).
const MONGODB_URI = process.env.MONGODB_URI;
// Optional fallback used when the primary can't be reached — handy for local
// dev when Atlas is paused / your IP isn't whitelisted. Defaults to a local
// MongoDB. Set MONGODB_URI_FALLBACK="" to disable the fallback entirely.
const MONGODB_URI_FALLBACK =
  process.env.MONGODB_URI_FALLBACK ??
  "mongodb://127.0.0.1:27017/tiffin-tracker";

// The list of URIs we'll try, in order, skipping any that are empty.
const URIS = [MONGODB_URI, MONGODB_URI_FALLBACK].filter(
  (u): u is string => typeof u === "string" && u.length > 0
);

if (URIS.length === 0) {
  throw new Error(
    "Missing MONGODB_URI. Add it to .env.local (see .env.local.example)."
  );
}

// Reuse the connection across hot reloads in dev and across serverless
// invocations in production, so we never open a flood of connections.
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cached;

// Fail fast instead of hanging ~30s on the default server-selection timeout,
// so an unreachable DB surfaces a 500 quickly (and we can try the fallback).
const CONNECT_OPTS = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 5000,
} as const;

async function connectWithFallback(): Promise<typeof mongoose> {
  let lastErr: unknown;
  for (const uri of URIS) {
    try {
      return await mongoose.connect(uri, CONNECT_OPTS);
    } catch (err) {
      lastErr = err;
      const label = uri.startsWith("mongodb+srv") ? "Atlas" : "local/other";
      console.warn(
        `MongoDB connection failed for ${label} URI, trying next…`,
        (err as Error)?.message
      );
    }
  }
  throw lastErr;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = connectWithFallback();
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Clear the cached rejected promise so the next request retries instead
    // of being stuck with a permanently-failed connection attempt.
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}
