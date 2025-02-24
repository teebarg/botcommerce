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
            className={cn(className, "bg-indigo-700 text-white px-8 rounded-full min-w-48")}
            size="md"
            startContent={<RefreshCcw className="h-4 w-4" />}
            onClick={() => window.location.reload()}
        >
            <span>Reload</span>
        </Button>
    );
};

export default Reload;
