"use client";

import Button from "@modules/common/components/button";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    useEffect(() => {
        // Log the error to an error reporting service
        /* eslint-disable no-console */
        console.error(error);
    }, [error]);

    return (
        <div className="h-screen flex flex-col">
            <div className="bg-default-100 flex items-center justify-center flex-1">
                <div className="max-w-lg mx-auto bg-content2 rounded-lg shadow-lg overflow-hidden">
                    <div className="px-6 py-8">
                        <h1 className="text-4xl font-bold mb-2">500</h1>
                        <p className="text-xl text-default-900 mb-4">Internal Server Error</p>
                        <p className="text-default-500 mb-6">Oops! Something went wrong on our end. We apologize for the inconvenience.</p>
                        <Link className="inline-block bg-primary hover:bg-primary-focus text-white font-semibold py-2 px-4 rounded-md mr-4" href="/">
                            Go back to homepage
                        </Link>
                        <Button className="block mt-6" color="danger" type="button" onPress={() => reset()}>
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
