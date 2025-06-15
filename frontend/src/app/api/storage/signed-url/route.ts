import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, getSignedUrl, initializeAdminSDK } from '@/services/firebase-admin';

/**
 * Generate a signed URL for a file in Firebase Storage
 * @route POST /api/storage/signed-url
 */
export async function POST(req: NextRequest) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Extract and verify the token
    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      // Initialize Firebase Admin SDK
      const initialized = await initializeAdminSDK();
      if (!initialized) {
        return NextResponse.json(
          { error: 'Firebase Admin SDK not initialized' },
          { status: 500 }
        );
      }
      
      decodedToken = await verifyIdToken(idToken);
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json(
        { error: 'Invalid ID token' },
        { status: 401 }
      );
    }

    // Get file path from request body
    const { filePath } = await req.json();
    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }

    // Check if user has access to this file
    // This is a basic check - in production, you'd want more robust validation
    if (!filePath.includes(`contracts/${decodedToken.uid}/`) && !decodedToken.admin) {
      return NextResponse.json(
        { error: 'Unauthorized to access this file' },
        { status: 403 }
      );
    }

    try {
      // Generate signed URL
      const url = await getSignedUrl(filePath);
      return NextResponse.json({ url });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return NextResponse.json(
        { error: 'Failed to generate signed URL' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 