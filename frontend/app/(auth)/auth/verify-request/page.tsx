"use client";

import React from "react";
import { Mail, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function VerifyRequestPage() {
    return (
        <div>
            <div className="p-4 md:p-8">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-6">
                        <Mail className="text-accent" size={24} />
                    </div>

                    <h2 className="text-2xl font-bold text-default-800 mb-3">Check your email</h2>

                    <p className="text-default-500 mb-2">We&apos;ve sent a magic link to your email</p>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-8">
                        <div className="flex items-start gap-3">
                            <Clock className="text-emerald-600 mt-0.5 flex-shrink-0" size={20} />
                            <div className="text-left">
                                <p className="text-sm font-medium text-emerald-800 mb-1">Link expires in 15 minutes</p>
                                <p className="text-xs text-emerald-700">Click the link in your email to sign in securely</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Button variant="emerald" size="lg" onClick={() => window.history.back()} className="w-full">
                            <ArrowLeft size={16} />
                            Back to sign in
                        </Button>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="mt-6 bg-secondary rounded-lg p-4">
                <h3 className="font-medium text-default-800 mb-2">Having trouble?</h3>
                <ul className="text-sm text-default-500 space-y-1">
                    <li>• Check your spam or junk folder</li>
                    <li>• Make sure the email address is correct</li>
                    <li>• Try resending the link if it&apos;s been a few minutes</li>
                </ul>
            </div>
        </div>
    );
}
