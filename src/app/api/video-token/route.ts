import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const apiKey = process.env.STREAM_VIDEO_API_KEY;
    const secret = process.env.STREAM_VIDEO_API_SECRET;

    console.log('🔍 Token generation:', { 
      userId, 
      hasApiKey: !!apiKey, 
      hasSecret: !!secret 
    });

    if (!apiKey || !secret) {
      return NextResponse.json(
        { error: 'Missing Stream Video credentials' }, 
        { status: 500 }
      );
    }

    // Generate JWT token for Stream Video
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiration = issuedAt + 3600; // 1 hour

    const token = jwt.sign(
      {
        iss: 'https://getstream.io',
        sub: `user/${userId}`,
        user_id: userId,
        iat: issuedAt,
        exp: expiration,
      },
      secret,
      { algorithm: 'HS256' }
    );

    console.log('✅ Token generated successfully for:', userId);
    return NextResponse.json({ token });
    
  } catch (error: any) {
    console.error('❌ Token generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' }, 
      { status: 500 }
    );
  }
}
