import { BackButton } from "@/components/back";
import React from "react";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <React.Fragment>
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/20 md:p-6 flex-1">
                <div className="absolute top-6 left-6 z-20">
                    <BackButton className="" />
                </div>
                <div className="max-w-md w-full bg-background rounded-2xl shadow-2xl p-8 pt-24 md:pt-8 transform transition-all hover:scale-105 duration-300 flex-1 md:flex-initial flex flex-col items-center">
                    {children}
                </div>
            </div>
        </React.Fragment>
    );
}
