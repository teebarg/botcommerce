import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Session } from "./lib/models";
/**
 * Middleware to handle onboarding status.
 */
export async function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;

    const cartId = searchParams.get("cart_id");
    const checkoutStep = searchParams.get("step");
    const cartIdCookie = request.cookies.get("_cart_id");

    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const token = request.cookies.get("access_token")?.value;
    let user = null;
    if (token) {
        user = jwt.verify(token, process.env.JWT_SECRET!) as unknown as Session;
    }

    if (["/sign-in", "/sign-up"].includes(pathname) && user) {
        const referer = request.headers.get("referer") as string;

        // Avoid redirecting to the sign-in page if referer is /sign-in
        if (referer?.includes("/sign-in") || referer?.includes("/sign-up")) {
            const url = new URL(callbackUrl, request.url);

            return NextResponse.redirect(url);
        }

        const url = new URL(referer || "/", request.url);

        return NextResponse.redirect(url);
    }

    if (!["/sign-in", "/sign-up"].includes(pathname) && !user) {
        const url = new URL(`/sign-in`, request.url);

        url.searchParams.set("callbackUrl", pathname);

        return NextResponse.redirect(url);
    }

    if (!cartId || cartIdCookie) {
        return NextResponse.next();
    }

    const redirectPath = request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname;

    const queryString = request.nextUrl.search ? request.nextUrl.search : "";

    let redirectUrl = request.nextUrl.href;

    let response = NextResponse.redirect(redirectUrl, 307);

    // If a cart_id is in the params, we set it as a cookie and redirect to the address step.
    if (cartId && !checkoutStep) {
        redirectUrl = `${redirectUrl}&step=address`;
        response = NextResponse.redirect(`${redirectUrl}`, 307);
        response.cookies.set("_cart_id", cartId, { maxAge: 60 * 60 * 24 });
    }

    return response;
}

export const config = {
    matcher: ["/sign-in", "/sign-up", "/account", "/account/:path*", "/admin/:path*", "/admin", "/wishlist"],
};
