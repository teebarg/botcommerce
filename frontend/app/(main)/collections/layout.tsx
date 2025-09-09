import React from "react";

export default async function CollectionsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full md:px-2 py-0 md:py-4 mx-auto max-w-9xl flex-1">
            <div className="flex gap-6">{children}</div>
        </div>
    );
}
