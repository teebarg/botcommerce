import React from "react";

import { Spinner } from "@/components/spinner";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-content1">
            <Spinner color="primary" size="lg" />
            <h2 className="mt-4 text-2xl font-semibold text-default-700">Loading...</h2>
            <p className="mt-2 text-default-500">Please wait while we prepare your content.</p>
        </div>
    );
}
