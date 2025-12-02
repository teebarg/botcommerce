import React from "react";

import Reload from "@/components/generic/reload";
import { BtnLink } from "@/components/ui/btnLink";
import { ArrowUpRight, TriangleAlert } from "lucide-react";


const NotFound = async () => {
    return (
        <div className="min-h-[50vh] flex items-center justify-center">
            <div className="max-w-2xl mx-auto text-center px-4">
                <TriangleAlert className="w-20 h-20 mx-auto text-destructive mb-8" />
                <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
                <p className="text-lg text-muted-foreground mb-8">
                    {`We couldn't find the product you're looking for. It might have been removed or is temporarily unavailable.`}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <BtnLink href="/collections" size="lg">
                        Browse Collections
                        <ArrowUpRight className="w-4 h-4" />
                    </BtnLink>
                    <Reload />
                </div>
            </div>
        </div>
    );
};

export default NotFound;
