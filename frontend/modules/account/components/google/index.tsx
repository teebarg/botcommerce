import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useSnackbar } from "notistack";
import Image from "next/image";

import Google from "@/public/google.svg";
import { Button } from "@/components/ui/button";
import { googleLogin } from "@/actions/auth";

interface Props {}

const GoogleLogin: React.FC<Props> = () => {
    const { enqueueSnackbar } = useSnackbar();

    const handleGoogleSignIn = useGoogleLogin({
        onSuccess: async (codeResponse: any) => {
            const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                method: "GET",
                headers: { Authorization: `Bearer ${codeResponse.access_token}` },
            }).then((res) => res.json());

            try {
                const res = await googleLogin({
                    email: userInfo.email,
                    password: "password",
                    firstname: userInfo.given_name,
                    lastname: userInfo.family_name,
                });

                if (res?.error) {
                    enqueueSnackbar(`Google Login request failed: ${res.message}`, { variant: "error" });
                }
            } catch (error: any) {
                enqueueSnackbar(`Google Login request failed: ${error.toString()}`, { variant: "error" });
            }
        },
        onError: (errorResponse: any) => {
            enqueueSnackbar(`Use Google Login request failed: ${errorResponse}`, { variant: "error" });
        },
    });

    return (
        <React.Fragment>
            <Button
                className="w-full bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600"
                size="md"
                startContent={<Image alt="Google" className="w-6" src={Google} />}
                variant="flat"
                onClick={() => handleGoogleSignIn()}
            >
                Sign in with Google
            </Button>
        </React.Fragment>
    );
};

export { GoogleLogin };
