import { google, lucia } from "@/auth";
import kyInstance from "@/lib/ky";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { slugify } from "@/lib/utils";
import { OAuth2RequestError } from "arctic";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  verified_email: boolean;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  console.log("🔄 OAuth callback initiated");
  
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  const cookieStore = cookies();
  const storedState = cookieStore.get("state")?.value;
  const storedCodeVerifier = cookieStore.get("code_verifier")?.value;

  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    console.error("❌ OAuth validation failed");
    return new NextResponse(null, { 
      status: 302,
      headers: { Location: "/login?error=oauth_validation_failed" }
    });
  }

  // Declare googleUser outside try block for proper scoping
  let googleUser: GoogleUser | null = null;

  try {
    // Clear OAuth cookies
    cookieStore.set("state", "", { maxAge: 0, path: "/" });
    cookieStore.set("code_verifier", "", { maxAge: 0, path: "/" });

    console.log("🔐 Validating authorization code with Google");
    const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);

    console.log("👤 Fetching user info from Google");
    googleUser = await kyInstance
      .get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
        timeout: 10000, // 10 second timeout
      })
      .json<GoogleUser>();

    console.log("✅ Google user data received:", {
      id: googleUser.id,
      name: googleUser.name,
      email: googleUser.email,
      verified: googleUser.verified_email
    });

    // Validate Google user data
    if (!googleUser.verified_email) {
      console.error("❌ Google email not verified");
      return new NextResponse(null, {
        status: 302,
        headers: { Location: "/login?error=email_not_verified" }
      });
    }

    // Enhanced user lookup - check both Google ID and email
    let existingUser = await prisma.user.findUnique({
      where: { googleId: googleUser.id },
    });

    // If no user found by Google ID, check by email
    if (!existingUser) {
      existingUser = await prisma.user.findUnique({
        where: { email: googleUser.email },
      });
    }

    if (existingUser) {
      console.log("🔄 Existing user found:", existingUser.id);
      
      // If user exists but doesn't have Google ID, update it
      if (!existingUser.googleId) {
        console.log("🔗 Linking Google account to existing user");
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            googleId: googleUser.id,
            // Update display name if it's different
            displayName: googleUser.name !== existingUser.displayName ? googleUser.name : existingUser.displayName,
          },
        });
      }

      // Update StreamChat user to ensure sync
      try {
        await streamServerClient.upsertUser({
          id: existingUser.id,
          username: existingUser.username,
          name: existingUser.displayName || existingUser.username,
        });
        console.log("✅ StreamChat user updated for existing user");
      } catch (streamError) {
        console.error("⚠️ StreamChat user update failed:", streamError);
        // Continue with login even if Stream update fails
      }

      // Create session for existing user
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      
      console.log("✅ Session created for existing user, redirecting to home");
      return new NextResponse(null, {
        status: 302,
        headers: { Location: "/" },
      });
    }

    console.log("👤 Creating new user");
    const userId = generateIdFromEntropySize(10);
    const baseUsername = slugify(googleUser.name);
    
    // Generate unique username with better collision handling
    let username = `${baseUsername}-${userId.slice(0, 4)}`;
    let usernameExists = await prisma.user.findUnique({ where: { username } });
    let counter = 1;
    
    while (usernameExists && counter < 100) { // Prevent infinite loops
      username = `${baseUsername}-${counter}`;
      usernameExists = await prisma.user.findUnique({ where: { username } });
      counter++;
    }

    if (counter >= 100) {
      // Fallback to timestamp-based username
      username = `${baseUsername}-${Date.now()}`;
    }

    // Create new user with transaction and improved error handling
    await prisma.$transaction(async (tx) => {
      console.log("💾 Creating user in database");
      
      const newUser = await tx.user.create({
        data: {
          id: userId,
          username,
          displayName: googleUser!.name,
          email: googleUser!.email,
          avatarUrl: null, // No Google profile photo as per your requirement
          googleId: googleUser!.id,
        },
      });
      
      console.log("💬 Creating StreamChat user");
      try {
        await streamServerClient.upsertUser({
          id: userId,
          username,
          name: googleUser!.name,
        });
        console.log("✅ StreamChat user created successfully");
      } catch (streamError) {
        console.error("⚠️ StreamChat user creation failed:", streamError);
        // Don't throw here - continue with user creation
        // StreamChat user can be created later when they access chat
      }

      return newUser;
    }, {
      timeout: 10000, // 10 second timeout for transaction
    });

    console.log("🔐 Creating session for new user");
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    console.log("✅ New user created successfully, redirecting to home");
    return new NextResponse(null, {
      status: 302,
      headers: { Location: "/" },
    });

  } catch (error: unknown) {
    console.error("💥 OAuth callback error:", error);
    
    if (error instanceof OAuth2RequestError) {
      console.error("🚫 OAuth2RequestError details:", {
        message: error.message,
        description: error.description,
      });
      return new NextResponse(null, { 
        status: 302,
        headers: { Location: "/login?error=oauth_request_failed" }
      });
    }
    
    // Handle Prisma unique constraint violations
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      console.error("🔄 Unique constraint violation:", 'meta' in error ? error.meta : 'No meta');
      
      // Try to find the existing user and log them in
      try {
        if (googleUser?.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: googleUser.email },
          });
          
          if (existingUser) {
            console.log("🔗 Found existing user during error recovery, creating session");
            const session = await lucia.createSession(existingUser.id, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
            
            return new NextResponse(null, {
              status: 302,
              headers: { Location: "/" },
            });
          }
        }
      } catch (recoveryError) {
        console.error("❌ Failed to recover from unique constraint error:", recoveryError);
      }
      
      return new NextResponse(null, {
        status: 302,
        headers: { Location: "/login?error=account_exists" },
      });
    }

    // Handle network/timeout errors
    if (error instanceof Error && (error.message.includes('timeout') || error.message.includes('network'))) {
      console.error("🌐 Network/timeout error during OAuth");
      return new NextResponse(null, {
        status: 302,
        headers: { Location: "/login?error=network_error" }
      });
    }
    
    // Generic error fallback
    return new NextResponse(null, { 
      status: 302,
      headers: { Location: "/login?error=authentication_failed" }
    });
  }
}
