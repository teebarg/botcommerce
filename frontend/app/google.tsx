"use client";

import { useEffect } from "react";
import authTap from "auth-tap";
import { toast } from "sonner";

import { googleLogin } from "@/actions/auth";

export default function Google() {
    const options: any = {
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!, // required
        auto_select: false, // optional
        context: "signin", // optional
    };

    useEffect(() => {
        authTap(options, async (response: any) => {
            // Send response to server
            const { email, given_name, family_name } = response;

            try {
                const res = await googleLogin({
                    email: email,
                    password: "password",
                    first_name: given_name,
                    last_name: family_name,
                });

                if (res?.error) {
                    toast.error(res.message);
                }
            } catch (error: any) {
                toast.error(error.toString());
            }
        });
    }, []);

    return <></>;
}
