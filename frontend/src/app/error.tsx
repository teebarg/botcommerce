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
            <div className="bg-default-50 flex items-center justify-center flex-1">
                <div className="max-w-lg mx-auto bg-content1 rounded-lg shadow-lg overflow-hidden">
                    <div className="px-6 py-8">
                        <h1 className="text-4xl font-bold mb-2 text-gray-800">500</h1>
                        <p className="text-xl text-default-600 mb-6">Internal Server Error</p>
                        <p className="text-default-700 mb-8 mr-4">Oops! Something went wrong on our end. We apologize for the inconvenience.</p>
                        <Link className="inline-block bg-primary hover:bg-primary-focus text-white font-semibold py-2 px-4 rounded-md" href="/">
                            Go back to homepage
                        </Link>
                        <Button className="block mt-6" color="danger" type="button" onClick={() => reset()}>
                            Try again
                        </Button>
                    </div>
                    <div className="px-6 py-4 bg-content2 border-t border-default-200 text-sm text-default-600">
                        If the problem persists, please contact our support team.
                    </div>
                </div>
            </div>
        </div>
    );
}
