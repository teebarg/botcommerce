import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

export async function authMiddleware(request: NextRequest) {
    const session = await auth();

    const { pathname, searchParams } = request.nextUrl;
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    // Redirect authenticated users away from sign-in/up pages
    if (["/auth/signin", "/auth/signup"].includes(pathname) && session) {
        const referer = request.headers.get("referer") as string;

        if (referer?.includes("/auth/signin") || referer?.includes("/auth/signup")) {
            return NextResponse.redirect(new URL(callbackUrl, request.url));
        }

        return NextResponse.redirect(new URL(referer || "/", request.url));
    }

    // Redirect unauthenticated users from protected pages
    if (!["/auth/signin", "/auth/signup"].includes(pathname) && !session) {
        const url = new URL(`/auth/signin`, request.url);

        url.searchParams.set("callbackUrl", pathname);

        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}
