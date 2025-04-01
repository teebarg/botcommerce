"use client";

import { useOverlayTriggerState } from "@react-stately/overlays";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MagicLinkForm } from "@/modules/auth/components/magic-link";

interface SignInPromptProps {
    callbackUrl?: string;
}

const SignInPrompt: React.FC<SignInPromptProps> = ({ callbackUrl }) => {
    const state = useOverlayTriggerState({});

    return (
        <div className="flex items-center justify-between">
            <p className="text-default-400 mb-4">
                Already have an account?{" "}
                <Dialog open={state.isOpen} onOpenChange={state.setOpen}>
                    <DialogTrigger>
                        <span className="text-blue-400">Log in</span>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Log in</DialogTitle>
                        </DialogHeader>
                        <MagicLinkForm callbackUrl={callbackUrl} />
                    </DialogContent>
                </Dialog>
            </p>
        </div>
    );
};

export default SignInPrompt;
