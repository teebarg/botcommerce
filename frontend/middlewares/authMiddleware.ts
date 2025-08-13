import { NextRequest, NextResponse } from "next/server";

// import { verifyToken } from "../actions/auth";

import { auth } from "@/auth";

export async function authMiddleware(request: NextRequest) {
    const session = await auth();

    console.log("🚀 ~ request ~ session:", session);
    const { pathname, searchParams } = request.nextUrl;
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    // const token = request.cookies.get("access_token")?.value;
    // let user = null;

    // if (token) {
    //     user = await verifyToken(token);
    // }

    // // Redirect authenticated users away from sign-in/up pages
    // if (["/sign-in", "/sign-up"].includes(pathname) && user) {
    //     const referer = request.headers.get("referer") as string;

    //     if (referer?.includes("/sign-in") || referer?.includes("/sign-up")) {
    //         return NextResponse.redirect(new URL(callbackUrl, request.url));
    //     }

    //     return NextResponse.redirect(new URL(referer || "/", request.url));
    // }

    // // Redirect unauthenticated users from protected pages
    // if (!["/sign-in", "/sign-up"].includes(pathname) && !user) {
    //     const url = new URL(`/sign-in`, request.url);

    //     url.searchParams.set("callbackUrl", pathname);

    //     return NextResponse.redirect(url);
    // }

    return NextResponse.next();
}
