"use client";

import React from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MagicLinkForm } from "@/components/generic/auth/magic-link";
import ClientOnly from "@/components/generic/client-only";
import { SignUpForm } from "@/components/generic/auth/signup";
import { Lock } from "lucide-react";

const CheckoutLoginPrompt: React.FC = () => {
    const pathname = usePathname();

    return (
        <ClientOnly>
            <div className="max-w-md mx-auto overflow-hidden md:max-w-2xl my-8">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="bg-blue-100 p-4 rounded-full">
                            <Lock className="w-12 h-12 text-primary" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-default-800">Sign in required</h2>
                        <p className="mt-2 text-default-600">Please sign in to your account to continue with your checkout process</p>
                    </div>

                    <div className="flex items-center justify-center">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="primary">Sign in to continue</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Log in</DialogTitle>
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
                                    <span className="font-medium text-primary hover:text-primary/80 ml-1">Create one now</span>
                                </p>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Sign Up</DialogTitle>
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
