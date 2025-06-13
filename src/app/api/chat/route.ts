import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface RequestBody {
  message: string;
  context?: string;
  history?: Message[];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('🚀 API Route called at:', new Date().toISOString());
  
  try {
    // 1. Check environment variables
    console.log('🔑 Checking API key...');
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'API key not configured. Please check your environment variables.' },
        { status: 500 }
      );
    }
    console.log('✅ API key found');

    // 2. Parse request body
    console.log('📝 Parsing request body...');
    let body: RequestBody;
    try {
      body = await request.json();
      console.log('✅ Request body parsed:', { 
        messageLength: body.message?.length, 
        context: body.context,
        historyLength: body.history?.length 
      });
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body format.' },
        { status: 400 }
      );
    }

    const { message, context, history = [] } = body;

    if (!message || typeof message !== 'string') {
      console.error('❌ Invalid message:', message);
      return NextResponse.json(
        { error: 'Message is required and must be a string.' },
        { status: 400 }
      );
    }

    // 3. Initialize Gemini with error handling
    console.log('🤖 Initializing Gemini AI...');
    let genAI: GoogleGenerativeAI;
    let model: any;
    
    try {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512,
        },
      });
      console.log('✅ Gemini model initialized');
    } catch (initError) {
      console.error('❌ Failed to initialize Gemini:', initError);
      return NextResponse.json(
        { error: 'Failed to initialize AI model. Please check API key validity.' },
        { status: 500 }
      );
    }

    // 4. Prepare prompt
    const systemPrompt = `You are a helpful AI assistant integrated into a social media chat application. 
    Help users with writing messages, translations, and general questions. 
    Keep responses concise and friendly (max 150 words).`;

    const fullMessage = context === 'chat_assistant' 
      ? `${systemPrompt}\n\nUser: ${message}` 
      : message;

    console.log('💭 Sending message to Gemini...');

    // 5. Generate response with timeout
    let result: any;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      result = await model.generateContent(fullMessage);
      clearTimeout(timeoutId);
      
      console.log('✅ Received response from Gemini');
    } catch (geminiError: any) {
      console.error('❌ Gemini API Error:', {
        message: geminiError.message,
        status: geminiError.status,
        code: geminiError.code,
        stack: geminiError.stack
      });

      // Handle specific Gemini errors
      if (geminiError.message?.includes('API_KEY')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your Gemini API configuration.' },
          { status: 401 }
        );
      }
      
      if (geminiError.message?.includes('QUOTA_EXCEEDED') || geminiError.status === 429) {
        return NextResponse.json(
          { error: 'API quota exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      if (geminiError.message?.includes('SAFETY')) {
        return NextResponse.json(
          { error: 'Content was blocked for safety reasons. Please rephrase your message.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: `Gemini API Error: ${geminiError.message}` },
        { status: 500 }
      );
    }

    // 6. Extract response text
    let responseText: string;
    try {
      const response = await result.response;
      responseText = response.text();
      
      if (!responseText || responseText.trim().length === 0) {
        throw new Error('Empty response from Gemini');
      }
      
      console.log('✅ Response extracted, length:', responseText.length);
    } catch (extractError) {
      console.error('❌ Failed to extract response:', extractError);
      return NextResponse.json(
        { error: 'Failed to process AI response.' },
        { status: 500 }
      );
    }

    console.log('🎉 API call successful');
    return NextResponse.json({
      response: responseText,
      success: true
    });

  } catch (error: any) {
    console.error('💥 Unexpected error in API route:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
