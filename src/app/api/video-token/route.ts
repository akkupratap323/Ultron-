import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const apiSecret = process.env.STREAM_SECRET_KEY!;

if (!apiKey || !apiSecret) {
  throw new Error('Missing Stream API key or secret');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    console.log("🎥 Video token request for userId:", userId);

    if (!userId) {
      console.error("❌ Missing userId in video token request");
      return NextResponse.json(
        { 
          error: "userId is required",
          receivedKeys: Object.keys(body)
        },
        { status: 400 }
      );
    }

    // Create JWT token for Stream Video
    const payload = {
      user_id: userId,
      iss: 'stream-video',
      sub: 'user/' + userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    };

    const token = jwt.sign(payload, apiSecret, {
      algorithm: 'HS256',
      header: {
        typ: 'JWT',
        alg: 'HS256',
      },
    });

    console.log("✅ Video token generated successfully for user:", userId);

    return NextResponse.json({ 
      token,
      userId,
      expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString()
    });

  } catch (error) {
    console.error("❌ Error generating video token:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate video token",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
