"use client";

import React from "react";
import { useEffect } from "react";

import NotFoundUI from "./not-found";

import { api } from "@/apis/client2";
import { cn } from "@/lib/utils";

const ServerError: React.FC<{ className?: string; error?: string; scenario?: string; stack?: string }> = ({ className, error, scenario, stack }) => {
    useEffect(() => {
        if (error) {
            const errorData = {
                message: error || "An error occurred",
                name: "Error",
                scenario,
                stack,
            };

            api.post("/log-error", errorData);
        }
    }, [error]);

    return <NotFoundUI className={cn("h-full", className)} scenario="server" />;
};

export default ServerError;
