import { NextResponse } from "next/server";

import { auth } from "@/auth";

export async function POST(req: Request) {
    const session = await auth();
    const accessToken = session?.accessToken;

    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const backendRes = await fetch(`${process.env.BACKEND_URL}/api/product/upload-products/`, {
        method: "POST",
        body: formData,
        headers: {
            "X-Auth": accessToken,
        },
    });

    if (!backendRes.ok) {
        const errorText = await backendRes.text();

        return NextResponse.json({ error: errorText || "Failed to upload products" }, { status: backendRes.status });
    }

    return NextResponse.json({ success: true });
}
