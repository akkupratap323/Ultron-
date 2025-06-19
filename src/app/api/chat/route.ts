import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are an AI assistant for a video calling and messaging application called "Ultron". You help users with:

**Video Call Features:**
- Starting and managing video calls using ZEGOCLOUD
- Sharing invite links to invite participants
- Troubleshooting video/audio issues
- Understanding call controls and settings

**Chat Features:**
- Using Stream Chat for messaging
- Managing conversations and chat history
- Understanding chat notifications and settings

**App Navigation:**
- Finding features in the sidebar and main interface
- Using the AI assistant panel
- Switching between light/dark themes

**Technical Support:**
- Resolving connection timeouts
- Fixing "removeChild" DOM errors
- Handling invite link issues
- Browser compatibility problems

Be helpful, concise, and specific to this video calling app. Always provide actionable steps and solutions.`;

    const prompt = `${systemPrompt}\n\nUser Question: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      response: text
    });

  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}
