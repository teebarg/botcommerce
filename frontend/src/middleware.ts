import { NextRequest, NextResponse } from "next/server";

// Helper to decode base64 URL strings
function base64UrlDecode(str: string) {
    return Uint8Array.from(atob(str.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
}

// Function to verify JWT
async function verifyJwt(token: string, secret: string) {
    const [header, payload, signature] = token.split(".");

    // Decode and parse the JWT header and payload
    const decodedHeader = JSON.parse(new TextDecoder().decode(base64UrlDecode(header)));
    const decodedPayload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));

    // Check if the algorithm matches
    if (decodedHeader.alg !== "HS256") {
        throw new Error("Unsupported algorithm");
    }

    // Import the secret key using Web Crypto API
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);

    // Verify the signature
    const isValid = await crypto.subtle.verify("HMAC", key, base64UrlDecode(signature), new TextEncoder().encode(`${header}.${payload}`));

    if (!isValid) {
        throw new Error("Invalid token");
    }

    return decodedPayload; // Return the payload if verification is successful
}

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

    let token = null;

    try {
        token = await verifyJwt(sessionCookie?.value as string, process.env.NEXT_PUBLIC_SECRET_KEY as string);
    } catch (error) {
        console.log(error);
    }

    if (["/sign-in", "/sign-up"].includes(pathname) && token) {
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
