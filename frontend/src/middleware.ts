import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to handle onboarding status.
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionCookie = request.cookies.get("access_token");

    const searchParams = request.nextUrl.searchParams;
    const cartId = searchParams.get("cart_id");
    const checkoutStep = searchParams.get("step");
    const cartIdCookie = request.cookies.get("_cart_id");

    // const { pathname, searchParams } = req.nextUrl;
    // const res = NextResponse.next();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    // const token = await getToken({ req });
    const token = sessionCookie?.value;
    if (["/sign-in", "/sign-up"].includes(pathname) && token) {
        console.log("User is authenticated and visiting auth, routing back to referer");
        const referer = request.headers.get("referer") as string;
        
        // Avoid redirecting to the sign-in page if referer is /sign-in
        if (referer?.includes("/sign-in") || referer?.includes("/sign-up")) {
            const url = new URL(callbackUrl, request.url);
            return NextResponse.redirect(url);
            // return NextResponse.redirect("/");
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

    if (pathname === "/logout") {
        console.log("When logging out clear cookie");
        const url = new URL("/sign-in", request.url);
        // url.searchParams.set("callbackUrl", callbackUrl);
        const logoutRes = NextResponse.redirect(url);
        logoutRes.cookies.set({
            name: "access_token",
            value: "",
            path: "/",
            maxAge: -1,
        });
        return logoutRes;
    }

    // return res;

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
    matcher: ["/((?!api|_next/static|favicon.ico).*)", "/sign-in", "/logout", "/dashboard/:path*", "/sign-up", "/profile", "/admin/:path*", "/admin"],
};
