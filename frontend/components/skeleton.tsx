import React from "react";

import { cn } from "@/lib/util/cn";

function Skeleton({ className }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("bg-gray-200 dark:bg-default-100 animate-pulse", className)} />;
}

export { Skeleton };
