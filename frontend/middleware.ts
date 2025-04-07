// import { NextRequest, NextResponse } from "next/server";

// /**
//  * Middleware to handle onboarding status.
//  */
// export async function middleware(request: NextRequest) {
//     const { pathname, searchParams } = request.nextUrl;

//     const checkoutStep = searchParams.get("step");
//     const cartIdCookie = request.cookies.get("_cart_id");

//     const callbackUrl = searchParams.get("callbackUrl") || "/";

//     const token = request.cookies.get("access_token")?.value;
//     let user = null;

//     if (token) {
//         user = await verifyToken(token);
//     }

//     if (["/sign-in", "/sign-up"].includes(pathname) && user) {
//         const referer = request.headers.get("referer") as string;

//         // Avoid redirecting to the sign-in page if referer is /sign-in
//         if (referer?.includes("/sign-in") || referer?.includes("/sign-up")) {
//             const url = new URL(callbackUrl, request.url);

//             return NextResponse.redirect(url);
//         }

//         const url = new URL(referer || "/", request.url);

//         return NextResponse.redirect(url);
//     }

//     if (!["/sign-in", "/sign-up"].includes(pathname) && !user) {
//         const url = new URL(`/sign-in`, request.url);

//         url.searchParams.set("callbackUrl", pathname);

//         return NextResponse.redirect(url);
//     }

//     const redirectPath = request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname;

//     const queryString = request.nextUrl.search ? request.nextUrl.search : "";

//     let redirectUrl = request.nextUrl.href;

//     let response = NextResponse.redirect(redirectUrl, 307);

//     // If a cart_id is in the params, we set it as a cookie and redirect to the address step.
//     if (!checkoutStep) {
//         redirectUrl = `${redirectUrl}&step=address`;
//         response = NextResponse.redirect(`${redirectUrl}`, 307);
//         response.cookies.set("_cart_id", generateId(), { maxAge: 60 * 60 * 24 });
//     }

//     return response;
// }

// export const config = {
//     matcher: ["/sign-in", "/sign-up", "/account", "/account/:path*", "/admin/:path*", "/admin", "/wishlist", "/collections"],
// };

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
