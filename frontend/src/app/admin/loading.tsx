import { Spinner } from "@modules/common/components/spinner";
import React from "react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100">
            <Spinner color="primary" size="lg" />
            <h2 className="mt-4 text-2xl font-semibold text-gray-700">Loading...</h2>
            <p className="mt-2 text-gray-500">Please wait while we prepare your content.</p>
        </div>
    );
}
