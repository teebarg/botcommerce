import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseServerClient } from "./supabase/supabase";

// Validation schemas
export const credentialsSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = credentialsSchema.extend({
    redirectUrl: z.string().optional(),
    fullName: z.string().optional(),
});

export const oauthSchema = z.object({
    redirectTo: z.string().optional(),
});

// Server functions
export const loginFn = createServerFn({ method: "POST" })
    .inputValidator((input: unknown) => credentialsSchema.parse(input))
    .handler(async ({ data }) => {
        const supabase = getSupabaseServerClient();
        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });

        if (error) {
            throw new Error(error.message);
        }

        return { success: true } as const;
    });

export const signupFn = createServerFn({ method: "POST" })
    .inputValidator((input: unknown) => signupSchema.parse(input))
    .handler(async ({ data }) => {
        const supabase = getSupabaseServerClient();
        const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                emailRedirectTo: data.redirectUrl,
                data: data.fullName ? { full_name: data.fullName } : undefined,
            },
        });

        if (error) {
            throw new Error(error.message);
        }

        return { success: true } as const;
    });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
        throw new Error(error.message);
    }

    return { success: true } as const;
});
