"use server";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import { deleteCookie } from "@/lib/util/cookie";
import { Session } from "@/schemas";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function verifyToken(token: string) {
    try {
        if (!secret) {
            throw new Error("JWT_SECRET environment variable is not defined");
        }

        const result = await jwtVerify(token, secret, {
            algorithms: ["HS256"],
        });

        if (!result) {
            return null;
        }

        return result.payload;
    } catch (error) {
        await deleteCookie("access_token");

        return null;
    }
}

export async function getSession() {
    const cookieStore = await cookies();

    return cookieStore.get("access_token")?.value || null;
}

export async function clearSession() {
    const cookieStore = await cookies();

    cookieStore.delete("access_token");
}

export async function auth(): Promise<Session | null> {
    const token = await getSession();

    if (!token) return null;

    try {
        const user = (await verifyToken(token)) as any;

        if (!user) return null;

        return {
            id: user.id,
            email: user.sub ?? user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            image: user.image,
            isActive: user.status === "ACTIVE",
            isAdmin: user.role === "ADMIN",
            status: user.status,
            role: user.role,
        };
    } catch (error) {
        return null;
    }
}
