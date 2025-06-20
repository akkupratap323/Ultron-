import { validateRequest } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // CRITICAL: Allow UploadThing routes to bypass all authentication
  if (request.nextUrl.pathname.startsWith('/api/uploadthing')) {
    console.log("🔄 UploadThing route detected, bypassing auth");
    return NextResponse.next();
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/register', 
    '/api/auth',
    '/api/uploadthing', // Redundant but explicit
     'api/character-chat',
     
  ];

  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Apply authentication for protected routes
  try {
    const { user } = await validateRequest();
    
    if (!user) {
      console.log("🚫 No authenticated user, redirecting to login");
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("❌ Middleware auth error:", error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    // Don't run middleware on these paths
    '/((?!api/uploadthing|_next/static|_next/image|favicon.ico).*)',
  ]
};
