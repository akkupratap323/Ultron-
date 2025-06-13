import { validateRequest } from "@/auth";
import streamServerClient from "@/lib/stream";
import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache for tokens (use Redis in production)
const tokenCache = new Map<string, { token: string; expires: number; lastRequest: number }>();

// Rate limiting: track requests per user
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  maxRequests: 10, // Max 10 token requests per minute
  windowMs: 60 * 1000, // 1 minute window
  tokenTTL: 60 * 60, // Token valid for 1 hour
};

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  // Reset if window expired
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs
    });
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1, resetTime: now + RATE_LIMIT.windowMs };
  }
  
  // Check if limit exceeded
  if (userLimit.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: userLimit.resetTime };
  }
  
  // Increment count
  userLimit.count++;
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - userLimit.count, resetTime: userLimit.resetTime };
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await validateRequest();

    console.log("🔑 Token request for user:", user?.id);

    if (!user) {
      console.error("❌ Unauthorized token request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Check rate limiting
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      console.warn(`⚠️ Rate limit exceeded for user: ${user.id}`);
      return NextResponse.json(
        { 
          error: "Too many token requests. Please wait before requesting again.",
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        }, 
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // 2. Check cache for existing valid token
    const cached = tokenCache.get(user.id);
    const now = Math.floor(Date.now() / 1000);
    
    if (cached && cached.expires > now + 300) { // Use cached if > 5 minutes remaining
      console.log("✅ Returning cached token for user:", user.id);
      return NextResponse.json(
        { token: cached.token },
        {
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString(),
            'Cache-Control': 'private, max-age=300' // Cache for 5 minutes
          }
        }
      );
    }

    // 3. Add delay to prevent rapid token generation
    const lastRequest = cached?.lastRequest || 0;
    const timeSinceLastRequest = Date.now() - lastRequest;
    if (timeSinceLastRequest < 2000) { // Minimum 2 seconds between new tokens
      const delay = 2000 - timeSinceLastRequest;
      console.log(`⏳ Throttling token generation, waiting ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // 4. Generate new token with proper timing
    const expirationTime = now + RATE_LIMIT.tokenTTL; // 1 hour from now
    const issuedAt = now - 60; // 1 minute ago to account for clock skew

    console.log("🔄 Generating new token for user:", user.id);
    
    let token: string;
    try {
      // Create token with Stream Chat server client
      token = streamServerClient.createToken(user.id, expirationTime, issuedAt);
    } catch (tokenError) {
      console.error("❌ Token generation failed:", tokenError);
      return NextResponse.json(
        { error: "Failed to generate token" },
        { status: 500 }
      );
    }

    // 5. Cache the new token
    tokenCache.set(user.id, { 
      token, 
      expires: expirationTime,
      lastRequest: Date.now()
    });

    // 6. Clean up old cache entries (prevent memory leaks)
    if (tokenCache.size > 1000) {
      const cutoff = now - RATE_LIMIT.tokenTTL;
      for (const [userId, data] of tokenCache.entries()) {
        if (data.expires < cutoff) {
          tokenCache.delete(userId);
        }
      }
    }

    console.log("✅ New token generated and cached for user:", user.id);

    return NextResponse.json(
      { token },
      {
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString(),
          'Cache-Control': 'private, max-age=300'
        }
      }
    );

  } catch (error) {
    console.error("💥 Token API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle POST requests for compatibility
export async function POST(request: NextRequest) {
  return GET(request);
}
