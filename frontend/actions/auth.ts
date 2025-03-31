"use server";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import { api } from "@/apis";
import { Session } from "@/types/models";
import { deleteCookie } from "@/lib/util/cookie";

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

export async function setSession(token: string) {
    const cookieStore = await cookies();

    cookieStore.set("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        // sameSite: "strict",
    });
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
        return null; // Token is invalid or expired
    }
}

export async function signUp(_currentState: unknown, formData: FormData) {
    const customer = {
        email: formData.get("email"),
        password: formData.get("password"),
        first_name: formData.get("first_name"),
        last_name: formData.get("last_name"),
        phone: formData.get("phone"),
    } as any;

    const { data, error } = await api.auth.signUp(customer);

    if (error || !data) return { error: true, message: error };

    const { access_token } = data;

    await setSession(access_token);

    return { error: false, message: "Successful" };
}

export async function googleLogin(customer: { first_name: string; last_name: string; password: string; email: string }) {
    const { data, error } = await api.auth.social(customer);

    if (error || !data) {
        return { error: true, message: error?.toString() };
    }

    await setSession(data.access_token);

    return { error: false, message: "Successfully signed in" };
}

export async function requestMagicLink(_prevState: unknown, formData: FormData) {
    const email = formData.get("email") as string;
    const callbackUrl = formData.get("callbackUrl") as string;

    try {
        const { data, error } = await api.auth.requestMagicLink(email, callbackUrl);

        if (error || !data) {
            return { error: true, message: error?.toString() };
        }

        return { error: false, message: data.message };
    } catch (error: any) {
        return { error: true, message: error.toString() };
    }
}

export async function verifyMagicLink(token: string) {
    const { data, error } = await api.auth.verifyMagicLink(token);

    if (error || !data) {
        return { error: true, message: error?.toString() };
    }

    await setSession(data.access_token);

    return { error: false, message: "Successfully signed in" };
}
