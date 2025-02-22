"use client";

import { useEffect } from "react";
import authTap from "auth-tap";
import { useSnackbar } from "notistack";
import { googleLogin } from "@/actions/auth";

export default function Google() {
    const { enqueueSnackbar } = useSnackbar();
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
                    firstname: given_name,
                    lastname: family_name,
                });

                if (res?.error) {
                    enqueueSnackbar(`Google Login request failed: ${res.message}`, { variant: "error" });
                }
            } catch (error: any) {
                enqueueSnackbar(`Google Login request failed: ${error.toString()}`, { variant: "error" });
            }
        });
    }, []);

    return <></>;
}
