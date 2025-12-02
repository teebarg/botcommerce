import { NextResponse } from "next/server";

export async function GET(request: Request) {
    return NextResponse.json({ message: "Hello, World!" });
}

export async function POST(request: Request) {
    const body = await request.json();

    return NextResponse.json({ message: "Received POST request", data: body });
}
