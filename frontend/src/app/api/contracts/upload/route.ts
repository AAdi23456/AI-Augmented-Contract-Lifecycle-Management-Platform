import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/services/firebase-admin';

// Backend API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

/**
 * Upload a contract and save its metadata
 * @route POST /api/contracts/upload
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
      decodedToken = await verifyIdToken(idToken);
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get contract data from request body
    const uploadData = await req.json();
    console.log('Contract upload data received:', uploadData);
    
    if (!uploadData || !uploadData.fileUrl) {
      return NextResponse.json(
        { error: 'File URL is required' },
        { status: 400 }
      );
    }

    // Ensure required fields are present
    if (!uploadData.title || !uploadData.fileType || !uploadData.fileSize) {
      return NextResponse.json(
        { error: 'Missing required metadata fields' },
        { status: 400 }
      );
    }

    // Prepare contract data
    const contractData = {
      title: uploadData.title,
      originalFilename: uploadData.originalFilename || uploadData.title,
      fileUrl: uploadData.fileUrl,
      fileType: uploadData.fileType,
      fileSize: uploadData.fileSize,
      extractedText: uploadData.extractedText,
      summary: uploadData.summary,
      description: uploadData.description,
      status: uploadData.status || 'Draft'
    };

    // Forward the request to the backend API to save metadata
    const response = await fetch(`${BACKEND_API_URL}/contracts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify(contractData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend API error:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to save contract metadata' },
        { status: response.status }
      );
    }

    const savedContract = await response.json();
    return NextResponse.json({
      success: true,
      message: 'Contract uploaded and metadata saved successfully',
      contract: savedContract
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 