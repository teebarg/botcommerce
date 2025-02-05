"use client";

import { cn } from "@lib/util/cn";
import { RefreshCcw } from "nui-react-icons";
import React from "react";
import { Button } from "@/components/ui/button";

interface Props {
    className?: string;
}

const Reload: React.FC<Props> = ({ className }) => {
    return (
        <Button
            aria-label="reload button"
            size="md"
            className={cn(className, "bg-indigo-700 text-white px-8 rounded-full min-w-48")}
            onClick={() => window.location.reload()}
        >
            <RefreshCcw className="h-4 w-4 mr-1" />
            <span>Reload</span>
        </Button>
    );
};

export default Reload;
