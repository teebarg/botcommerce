import React from "react";

import { cn } from "@/lib/utils";

function Skeleton({ className }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("bg-gray-200 dark:bg-default-100 animate-pulse", className)} />;
}

export { Skeleton };
