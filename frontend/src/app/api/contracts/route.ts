import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, initializeAdminSDK } from '@/services/firebase-admin';
import { serviceAccountConfig } from '@/config/firebase-config';

// Backend API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

/**
 * Create a new contract
 * @route POST /api/contracts
 */
export async function POST(req: NextRequest) {
  try {
    console.log('API route: Creating contract');
    
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
    const contractData = await req.json();
    console.log('Contract data received:', contractData);
    
    if (!contractData) {
      return NextResponse.json(
        { error: 'Contract data is required' },
        { status: 400 }
      );
    }

    // Forward the request to the backend API
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
        { error: errorData.message || 'Failed to create contract' },
        { status: response.status }
      );
    }

    const newContract = await response.json();
    return NextResponse.json(newContract);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * Get all contracts
 * @route GET /api/contracts
 */
export async function GET(req: NextRequest) {
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

    // Forward the request to the backend API
    const response = await fetch(`${BACKEND_API_URL}/contracts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend API error:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch contracts' },
        { status: response.status }
      );
    }

    const contracts = await response.json();
    return NextResponse.json(contracts);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}