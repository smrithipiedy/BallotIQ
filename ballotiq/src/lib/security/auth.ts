import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

/**
 * Validates the Authorization header and returns the decoded Firebase ID token.
 * 
 * @param req NextRequest
 * @returns DecodedIdToken if valid, null if invalid or missing
 */
export async function verifyAuthToken(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying auth token', error);
    return null;
  }
}

/**
 * Middleware wrapper for Next.js API routes to enforce authentication.
 * If the request is a state-mutating method (POST, PUT, PATCH, DELETE) and lacks a valid token,
 * it returns a 401 Unauthorized response.
 * 
 * @param handler The API route handler function
 * @returns A wrapped API route handler
 */
export function withAuth(handler: (req: NextRequest, ...args: unknown[]) => Promise<Response>) {
  return async (req: NextRequest, ...args: unknown[]) => {
    // Check if the request is state-mutating
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const decodedToken = await verifyAuthToken(req);
      if (!decodedToken) {
        return NextResponse.json(
          { error: 'Unauthorized: Missing or invalid authentication token.' },
          { status: 401 }
        );
      }
      
      // Inject user info into headers or pass to handler if needed
      // (Next.js App router doesn't allow mutating req easily, but we know it's verified)
    }

    return handler(req, ...args);
  };
}
