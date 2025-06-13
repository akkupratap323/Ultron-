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
    return new NextResponse(null, { status: 400 });
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
      })
      .json<GoogleUser>();

    console.log("✅ Google user data received:", {
      id: googleUser.id,
      name: googleUser.name,
      email: googleUser.email,
    });

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
      console.log("🔄 Existing user found");
      
      // If user exists but doesn't have Google ID, update it
      if (!existingUser.googleId) {
        console.log("🔗 Linking Google account to existing user");
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            googleId: googleUser.id,
          },
        });
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

    console.log("👤 Creating new user without Google profile photo");
    const userId = generateIdFromEntropySize(10);
    const baseUsername = slugify(googleUser.name);
    
    // Generate unique username
    let username = `${baseUsername}-${userId.slice(0, 4)}`;
    let usernameExists = await prisma.user.findUnique({ where: { username } });
    let counter = 1;
    
    while (usernameExists) {
      username = `${baseUsername}-${counter}`;
      usernameExists = await prisma.user.findUnique({ where: { username } });
      counter++;
    }

    // Create new user with transaction
    await prisma.$transaction(async (tx) => {
      console.log("💾 Creating user in database without avatar");
      
      await tx.user.create({
        data: {
          id: userId,
          username,
          displayName: googleUser!.name, // Non-null assertion since we know it exists here
          email: googleUser!.email,
          avatarUrl: null,
          googleId: googleUser!.id,
        },
      });
      
      console.log("💬 Creating StreamChat user without avatar");
      try {
        await streamServerClient.upsertUser({
          id: userId,
          username,
          name: googleUser!.name,
        });
        console.log("✅ StreamChat user created successfully without avatar");
      } catch (streamError) {
        console.error("⚠️ StreamChat user creation failed:", streamError);
        // Continue with user creation even if Stream fails
      }
    });

    console.log("🔐 Creating session for new user");
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    console.log("✅ New user created successfully without Google photos, redirecting to home");
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
      return new NextResponse(null, { status: 400 });
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
            console.log("🔗 Found existing user, creating session");
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
    
    return new NextResponse(null, { status: 500 });
  }
}
