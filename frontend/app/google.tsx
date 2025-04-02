"use client";

import { useEffect } from "react";
import authTap from "auth-tap";
import { toast } from "sonner";

import { api } from "@/apis";

export default function Google() {
    const options: any = {
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!, // required
        auto_select: false, // optional
        context: "signin", // optional
    };

    useEffect(() => {
        authTap(options, async (response: any) => {
            // Send response to server
            const { email, given_name, family_name, picture } = response;

            const { error } = await api.auth.social({
                email,
                first_name: given_name,
                last_name: family_name,
                image: picture,
            });

            if (error) {
                toast.error(error);

                return;
            }
        });
    }, []);

    return null;
}
