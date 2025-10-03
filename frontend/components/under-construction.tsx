"use client";

import React, { useState, useEffect } from "react";
import { Wrench, AlertCircle, Cog, Hammer } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const UnderConstruction: React.FC = () => {
    const [isVisible, setIsVisible] = useState<boolean>(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="flex flex-col">
            <div className="flex flex-1 items-center justify-center px-4 py-12 md:py-24 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <div className={`transform transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
                        <div className="relative mb-8">
                            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                                <Wrench className="h-12 w-12 animate-bounce text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2 flex h-8 w-8 animate-spin items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
                                <Cog className="h-4 w-4 text-white" />
                            </div>
                            <div className="absolute -bottom-2 -left-2 flex h-6 w-6 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                                <Hammer className="h-3 w-3 text-white" />
                            </div>
                        </div>

                        <Badge className="mb-8 rounded-full px-6 py-3 text-sm border-0 [&>svg]:size-4" variant="secondary">
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Under Construction
                        </Badge>

                        <h1 className="mb-6 text-4xl leading-tight font-bold md:text-6xl">
                            {`We're building something`}
                            <span className="block bg-primary bg-clip-text text-transparent">amazing here</span>
                        </h1>

                        <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed">
                            This page is currently under active development. Our team is working hard to bring you an exceptional experience. Check
                            back soon!
                        </p>

                        <div className="text-center">
                            <p className="mb-6">Want to be notified when this page is ready?</p>
                            <a
                                className="rounded-full border-2 border-secondary px-8 py-3 text-secondary transition-all duration-200 hover:bg-secondary/80"
                                href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}
                            >
                                Contact Support
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnderConstruction;
