"use client";

import React from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MagicLinkForm } from "@/components/generic/auth/magic-link";
import ClientOnly from "@/components/generic/client-only";
import { SignUpForm } from "@/components/generic/auth/signup";

const CheckoutLoginPrompt: React.FC = () => {
    const pathname = usePathname();

    return (
        <ClientOnly>
            <div className="max-w-md mx-auto overflow-hidden md:max-w-2xl my-8">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="bg-indigo-100 p-3 rounded-full">
                            <svg
                                className="w-8 h-8 text-indigo-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-default-800">Sign in required</h2>
                        <p className="mt-3 text-default-600">Please sign in to your account to continue with your checkout process</p>
                    </div>

                    <div className="flex items-center justify-center">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>Sign in to continue</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="sr-only">Log in</DialogTitle>
                                </DialogHeader>
                                <MagicLinkForm callbackUrl={pathname} />
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="mt-6 text-center text-sm text-default-500">
                        <Dialog>
                            <DialogTrigger>
                                <p>
                                    {`Don't have an account?`}
                                    <span className="font-medium text-indigo-600 hover:text-indigo-500">Create one now</span>
                                </p>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="sr-only">Sign Up</DialogTitle>
                                </DialogHeader>
                                <SignUpForm />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </ClientOnly>
    );
};

export default CheckoutLoginPrompt;
