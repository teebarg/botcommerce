import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "ng";

const regionMapCache = {
    regionMap: new Map<string, Region>(),
    regionMapUpdated: Date.now(),
};

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const cartId = searchParams.get("cart_id");
    const checkoutStep = searchParams.get("step");
    const cartIdCookie = request.cookies.get("_cart_id");

    // check if one of the country codes is in the url
    if ((!cartId || cartIdCookie)) {
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
    matcher: ["/((?!api|_next/static|favicon.ico).*)"],
};
