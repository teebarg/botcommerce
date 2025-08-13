import { NextRequest, NextResponse } from "next/server";

import { authMiddleware } from "./middlewares/authMiddleware";

/**
 * Main middleware handler
 */
export async function middleware(request: NextRequest) {
    // Run authMiddleware only for protected routes
    const protectedRoutes = ["/sign-in", "/sign-up", "/account", "/admin", "/wishlist"];

    if (protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
        const authResponse = await authMiddleware(request);

        if (authResponse) return authResponse;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/:path*"], // Apply middleware to all routes
};
