"use server"; // For server-side usage in Next.js 15

import { cookies } from "next/headers";

// ✅ Get a cookie (Synchronous on Client, Asynchronous on Server)
export async function getCookie(name: string): Promise<string | null> {
    if (typeof window === "undefined") {
        // Server-side: Use Next.js `cookies()`, which is async
        const cookieStore = await cookies();

        return cookieStore.get(name)?.value || null;
        // throw new Error("getCookie cannot be used synchronously in server components.");
    } else {
        // Client-side: Use `document.cookie`
        const match = document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`);

        return match ? decodeURIComponent(match[2]) : null;
    }
}
