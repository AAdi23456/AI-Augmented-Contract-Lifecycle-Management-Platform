import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, initializeAdminSDK } from '@/services/firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as https from 'https';
import * as util from 'util';

// For PDF parsing
let pdfParse: any;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  console.warn('pdf-parse module not available, PDF extraction will not work');
}

// For DOCX parsing
let mammoth: any;
try {
  mammoth = require('mammoth');
} catch (e) {
  console.warn('mammoth module not available, DOCX extraction will not work');
}

const streamPipeline = util.promisify(require('stream').pipeline);

/**
 * Extract text from a contract file
 * @route POST /api/contracts/extract
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
    try {
      await verifyIdToken(idToken);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid ID token' },
        { status: 401 }
      );
    }

    // Get file URL from request body
    const { fileUrl } = await req.json();
    if (!fileUrl) {
      return NextResponse.json(
        { error: 'File URL is required' },
        { status: 400 }
      );
    }

    // Determine file type from URL
    const fileType = getFileTypeFromUrl(fileUrl);
    if (!fileType) {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    // Download the file to a temporary location
    const tempFilePath = await downloadFile(fileUrl);

    try {
      // Extract text based on file type
      let text = '';
      
      if (fileType === 'pdf') {
        if (!pdfParse) {
          throw new Error('PDF parsing module not available');
        }
        
        const dataBuffer = fs.readFileSync(tempFilePath);
        const pdfData = await pdfParse(dataBuffer);
        text = pdfData.text;
      } else if (fileType === 'docx') {
        if (!mammoth) {
          throw new Error('DOCX parsing module not available');
        }
        
        const result = await mammoth.extractRawText({ path: tempFilePath });
        text = result.value;
      } else {
        throw new Error(`Extraction for ${fileType} not implemented`);
      }

      // Clean up the text
      text = cleanText(text);

      return NextResponse.json({ 
        text,
        fileType,
        tokenCount: text.split(/\s+/).length
      });
    } finally {
      // Clean up temporary file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (error) {
        console.warn('Error deleting temporary file:', error);
      }
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Text extraction failed' },
      { status: 500 }
    );
  }
}

/**
 * Download a file from a URL to a temporary location
 * @param url The URL of the file to download
 * @returns The path to the downloaded file
 */
async function downloadFile(url: string): Promise<string> {
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, `contract-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`);
  
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(tempFilePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${response.statusCode}`));
        return;
      }
      
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(tempFilePath);
      });
    }).on('error', (error) => {
      fs.unlink(tempFilePath, () => {});
      reject(error);
    });
  });
}

/**
 * Determine the file type from a URL
 * @param url The URL of the file
 * @returns The file type ('pdf', 'docx', etc.) or null if unsupported
 */
function getFileTypeFromUrl(url: string): string | null {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.endsWith('.pdf')) {
    return 'pdf';
  } else if (lowerUrl.endsWith('.docx')) {
    return 'docx';
  } else if (lowerUrl.endsWith('.doc')) {
    return 'doc';
  }
  
  // Try to extract from query parameters or path segments
  const urlObj = new URL(url);
  const pathSegments = urlObj.pathname.split('/');
  const lastSegment = pathSegments[pathSegments.length - 1];
  
  if (lastSegment.includes('.pdf')) {
    return 'pdf';
  } else if (lastSegment.includes('.docx')) {
    return 'docx';
  } else if (lastSegment.includes('.doc')) {
    return 'doc';
  }
  
  // Check for content type in URL parameters (some storage services include this)
  if (urlObj.searchParams.has('contentType')) {
    const contentType = urlObj.searchParams.get('contentType');
    if (contentType?.includes('pdf')) {
      return 'pdf';
    } else if (contentType?.includes('docx') || contentType?.includes('document')) {
      return 'docx';
    }
  }
  
  return null;
}

/**
 * Clean and normalize extracted text
 * @param text The raw extracted text
 * @returns Cleaned text
 */
function cleanText(text: string): string {
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, ' ');
  
  // Remove page numbers and headers/footers (simple heuristic)
  cleaned = cleaned.replace(/Page \d+ of \d+/gi, '');
  
  // Remove common PDF artifacts
  cleaned = cleaned.replace(/\f/g, '\n'); // Form feed to newline
  
  // Normalize line endings
  cleaned = cleaned.replace(/\r\n/g, '\n');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
} 