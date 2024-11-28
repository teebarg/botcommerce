"use client";

import { useEffect } from "react";
import authTap from "auth-tap";


export default function Google() {
    const options: any = {
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!, // required
        auto_select: false, // optional
        // cancel_on_tap_outside: false, // optional
        context: "signin", // optional
    };

    useEffect(() => {
        console.log("here......")
        authTap(options, (response) => {
            // Send response to server
            console.log("Signed in:", response);
        });
    }, []);

    return <>Google</>;
}
