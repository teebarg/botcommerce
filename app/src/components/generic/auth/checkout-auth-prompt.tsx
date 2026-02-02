import type React from "react";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MagicLinkForm } from "@/components/generic/auth/magic-link";
import { useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";

const CheckoutLoginPrompt: React.FC = () => {
    const location = useLocation();
    const pathname = location.pathname;

    return (
        <div className="max-w-md mx-auto overflow-hidden md:max-w-2xl my-8">
            <div className="p-8">
                <div className="flex justify-center mb-6">
                    <div className="bg-primary/10 p-4 rounded-full">
                        <Lock className="w-12 h-12 text-primary" />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold">Sign in required</h2>
                    <p className="mt-2 text-muted-foreground">Please sign in to your account to continue with your checkout process</p>
                </div>

                <div className="flex items-center justify-center">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>Sign in to continue</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Log in</DialogTitle>
                            </DialogHeader>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <MagicLinkForm callbackUrl={pathname} />
                                </motion.div>
                            </AnimatePresence>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default CheckoutLoginPrompt;
