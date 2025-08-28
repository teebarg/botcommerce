import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { auth } from "@/auth";

const AUTH_PATHS = new Set<string>(["/auth/signin", "/auth/error", "/auth/verify-request"]);

export default async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const session = await auth();

    if (AUTH_PATHS.has(pathname)) {
        if (session) {
            const origin = new URL("/", req.nextUrl.origin);

            return NextResponse.redirect(origin);
        }

        return NextResponse.next();
    }

    if (!session) {
        const signInUrl = new URL("/auth/signin", req.nextUrl.origin);

        signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);

        return NextResponse.redirect(signInUrl);
    }

    if (pathname.startsWith("/admin") && !session?.user?.isAdmin) {
        return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/account", "/account/:path*", "/auth/:path*", "/admin", "/admin/:path*", "/wishlist"],
};
