import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/services/firebase-admin';
import OpenAI from 'openai';

/**
 * Summarize contract text using OpenAI GPT-3.5
 * @route POST /api/contracts/summarize
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

    // Get text from request body
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Limit text length to avoid token limits
    const truncatedText = text.slice(0, 10000); // Limit to ~10k characters

    try {
      // Initialize OpenAI client
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes legal contracts. Provide a concise 5-bullet summary of the key points.'
          },
          {
            role: 'user',
            content: `Please summarize this contract text in 5 bullet points, highlighting the most important terms and conditions:\n\n${truncatedText}`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const summary = completion.choices[0]?.message?.content || 'Summary not available';
      return NextResponse.json({ summary });
    } catch (error) {
      console.error('Summary generation error:', error);
      return NextResponse.json(
        { error: 'Failed to generate summary' },
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