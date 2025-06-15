import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, createCustomToken, initializeAdminSDK } from '@/services/firebase-admin';

/**
 * Verify Firebase ID token and return user information
 * @route POST /api/auth/verify
 */
export async function POST(
  req: NextRequest,
  context: { params: { nextauth: string[] } }
) {
  try {
    const action = context.params.nextauth[0];
    
    if (action === 'verify') {
      const { idToken } = await req.json();
      
      if (!idToken) {
        return NextResponse.json(
          { error: 'ID token is required' },
          { status: 400 }
        );
      }
      
      try {
        // Initialize Firebase Admin SDK
        const initialized = await initializeAdminSDK();
        if (!initialized) {
          return NextResponse.json(
            { error: 'Firebase Admin SDK not initialized' },
            { status: 500 }
          );
        }
        
        // Verify the ID token using Firebase Admin SDK
        const decodedToken = await verifyIdToken(idToken);
        
        return NextResponse.json({
          user: {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
            displayName: decodedToken.name,
            photoURL: decodedToken.picture,
            role: decodedToken.role || 'user',
          }
        });
      } catch (error) {
        console.error('Error verifying ID token:', error);
        return NextResponse.json(
          { error: 'Invalid ID token' },
          { status: 401 }
        );
      }
    } else if (action === 'token') {
      const { uid, claims } = await req.json();
      
      if (!uid) {
        return NextResponse.json(
          { error: 'User ID is required' },
          { status: 400 }
        );
      }
      
      try {
        // Initialize Firebase Admin SDK
        const initialized = await initializeAdminSDK();
        if (!initialized) {
          return NextResponse.json(
            { error: 'Firebase Admin SDK not initialized' },
            { status: 500 }
          );
        }
        
        // Create a custom token using Firebase Admin SDK
        const customToken = await createCustomToken(uid, claims);
        
        return NextResponse.json({ token: customToken });
      } catch (error) {
        console.error('Error creating custom token:', error);
        return NextResponse.json(
          { error: 'Failed to create custom token' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 