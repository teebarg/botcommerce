import type React from "react";
import { useEffect } from "react";
import NotFound from "@/components/generic/not-found";
import { clientApi } from "@/utils/api.client";
import { Message } from "@/schemas";

const ServerError: React.FC<{ error?: string; scenario?: string; stack?: string }> = ({ error, scenario, stack }) => {
    useEffect(() => {
        if (error) {
            const errorData = {
                message: error || "An error occurred",
                scenario,
                stack,
            };
            clientApi.post<Message>("/log-error", errorData)
        }
    }, [error]);

    return <NotFound />;
};

export default ServerError;
