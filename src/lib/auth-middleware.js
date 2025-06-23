import { NextResponse } from 'next/server';

import { adminDb, adminAuth } from './firebase-admin';

/**
 * Middleware to verify Firebase ID token and extract user information
 * @param {Request} request - The incoming request
 * @returns {Promise<{user: Object, error: null} | {user: null, error: Object}>}
 */
export async function verifyAuth(request) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Missing or invalid authorization header' },
          { status: 401 }
        )
      };
    }

    // Extract the token
    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'No token provided' },
          { status: 401 }
        )
      };
    }

    // Verify the token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Fetch user data from Firestore to get the role and other server-side data
    let userData = null;
    try {
      // First, try to find user by uid field in the users collection
      const usersRef = adminDb.collection('users');
      const userQuery = await usersRef.where('uid', '==', decodedToken.uid).get();
      
      if (!userQuery.empty) {
        // User found by uid field
        const userDoc = userQuery.docs[0];
        userData = {
          id: userDoc.id,
          ...userDoc.data()
        };
      } else {
        // Fallback: try to find user by document ID (if uid is used as document ID)
        const userDocRef = adminDb.collection('users').doc(decodedToken.uid);
        const userDoc = await userDocRef.get();
        
        if (userDoc.exists) {
          userData = {
            id: userDoc.id,
            ...userDoc.data()
          };
        }
      }
    } catch (dbError) {
      console.error('Error fetching user data from Firestore:', dbError);
      // Continue without user data - the user is authenticated but may not have additional data
    }
    
    return {
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        // Add database fields (including role) - these are trusted since they come from our DB
        role: userData?.role || 'user', // Default to 'user' if no role specified
        gameuid: userData?.gameuid || null,
        nationality: userData?.nationality || null,
        mainTroops: userData?.mainTroops || null,
        nickname: userData?.nickname || null,
        // Include other token claims but prioritize DB data for security-critical fields
        ...decodedToken,
        // Override with DB data to ensure server-side data takes precedence
        ...(userData && { dbData: userData })
      },
      error: null
    };

  } catch (error) {
    console.error('Auth verification error:', error);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/id-token-expired') {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Token expired' },
          { status: 401 }
        )
      };
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Token revoked' },
          { status: 401 }
        )
      };
    }

    return {
      user: null,
      error: NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    };
  }
}

/**
 * Higher-order function to protect API routes
 * @param {Function} handler - The API route handler
 * @returns {Function} Protected API route handler
 */
export function withAuth(handler) {
  return async function protectedHandler(request, context) {
    const { user, error } = await verifyAuth(request);
    
    if (error) {
      return error;
    }

    // Add user to the request context
    request.user = user;
    
    return handler(request, context);
  };
}

/**
 * Check if user has specific role (now uses DB-fetched role)
 * @param {Object} user - The authenticated user (with DB data)
 * @param {string|Array} allowedRoles - Role(s) allowed to access
 * @returns {boolean}
 */
export function hasRole(user, allowedRoles) {
  if (!user || !user.role) return false;
  
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
}

/**
 * Higher-order function to protect API routes with role-based access
 * @param {Function} handler - The API route handler
 * @param {string|Array} allowedRoles - Role(s) allowed to access
 * @returns {Function} Protected API route handler with role check
 */
export function withAuthAndRole(handler, allowedRoles) {
  return async function protectedHandler(request, context) {
    const { user, error } = await verifyAuth(request);
    
    if (error) {
      return error;
    }

    // Check if user has required role
    if (!hasRole(user, allowedRoles)) {
      return NextResponse.json(
        { error: `Unauthorized: Required role(s): ${Array.isArray(allowedRoles) ? allowedRoles.join(', ') : allowedRoles}` },
        { status: 403 }
      );
    }

    // Add user to the request context
    request.user = user;
    
    return handler(request, context);
  };
} 