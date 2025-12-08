import type React from "react";
import { useEffect } from "react";
import NotFoundUI from "./not-found";
import { cn } from "@/utils";
import { createErrorFn } from "@/server/generic.server";

const ServerError: React.FC<{ className?: string; error?: string; scenario?: string; stack?: string }> = ({ className, error, scenario, stack }) => {
    useEffect(() => {
        if (error) {
            const errorData = {
                message: error || "An error occurred",
                scenario,
                stack,
            };
            createErrorFn({ data: errorData });
        }
    }, [error]);

    return <NotFoundUI className={cn("h-full", className)} scenario="server" />;
};

export default ServerError;
