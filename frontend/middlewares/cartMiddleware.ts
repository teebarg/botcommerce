import { NextRequest, NextResponse } from "next/server";

import { generateId } from "@/lib/util/util";

export async function cartMiddleware(request: NextRequest) {
    let cartIdCookie = request.cookies.get("_cart_id")?.value;

    if (!cartIdCookie) {
        const newCartId = generateId();

        console.log("🛒 Generating new cartId:", newCartId);

        const response = NextResponse.next();

        response.cookies.set("_cart_id", newCartId, {
            maxAge: 60 * 60 * 24 * 7, // 7 days
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        return response;
    }

    return NextResponse.next();
}
