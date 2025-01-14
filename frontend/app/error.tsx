"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import LocalizedClientLink from "@/modules/common/components/localized-client-link";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    useEffect(() => {
        if (error) {
            // Prepare the error data
            const errorData = {
                message: error.message || "An error occurred",
                name: error.name || "Error",
                stack: error.stack || "",
                timestamp: new Date().toISOString(),
            };

            // Send the error to the server
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/log-error`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(errorData),
            });
        }
    }, [error]);

    return (
        <div className="h-screen flex flex-col">
            <div className="bg-default-100 flex items-center justify-center flex-1">
                <div className="max-w-lg mx-auto bg-content2 rounded-lg shadow-lg overflow-hidden">
                    <div className="px-6 py-8">
                        <h1 className="text-4xl font-bold mb-2">500</h1>
                        <p className="text-xl text-default-900 mb-4">Internal Server Error</p>
                        <p className="text-default-500 mb-6">Oops! Something went wrong on our end. We apologize for the inconvenience.</p>
                        <LocalizedClientLink
                            className="inline-block bg-primary hover:bg-primary-focus text-white font-semibold py-2 px-4 rounded-md mr-4"
                            href="/"
                        >
                            Go back to homepage
                        </LocalizedClientLink>
                        <Button aria-label="try again" className="block mt-6" color="danger" type="button" onClick={() => reset()}>
                            Try again
                        </Button>
                    </div>
                    <div className="px-6 py-4 bg-content2 border-t border-default-100 text-sm text-default-500">
                        If the problem persists, please contact our support team.
                    </div>
                </div>
            </div>
        </div>
    );
}
