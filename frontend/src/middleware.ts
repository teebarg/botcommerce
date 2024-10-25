import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to handle onboarding status.
 */
export async function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;
    const sessionCookie = request.cookies.get("access_token");

    const cartId = searchParams.get("cart_id");
    const checkoutStep = searchParams.get("step");
    const cartIdCookie = request.cookies.get("_cart_id");

    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const token = sessionCookie?.value;

    if (["/sign-in", "/sign-up"].includes(pathname) && token) {
        console.log("User is authenticated and visiting auth, routing back to referer");
        const referer = request.headers.get("referer") as string;

        // Avoid redirecting to the sign-in page if referer is /sign-in
        if (referer?.includes("/sign-in") || referer?.includes("/sign-up")) {
            const url = new URL(callbackUrl, request.url);

            return NextResponse.redirect(url);
        }

        const url = new URL(referer || "/", request.url);

        return NextResponse.redirect(url);
    }

    if (!["/sign-in", "/sign-up"].includes(pathname) && !token) {
        console.log("route to sign-in");
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
    matcher: ["/sign-in", "/sign-up", "/account", "/admin/:path*", "/admin"],
};
