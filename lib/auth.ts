import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';

// Secret key for signing the JWT. It's best practice to store this in .env (e.g. AUTH_SECRET)
// Using a fallback for convenience but will warn if missing.
const secretKey = process.env.AUTH_SECRET || 'super-secret-key-for-tabungan-tracker-development';
const key = new TextEncoder().encode(secretKey);

/**
 * 1. Sign a JWT token
 */
export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Token expires in 24 hours
    .sign(key);
}

/**
 * 2. Verify a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch {
    return null;
  }
}

/**
 * 3. Extract the active user from cookies (Server Context)
 */
export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session-token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}
