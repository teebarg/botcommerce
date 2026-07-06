import { Tag } from "lucide-react";
import { Link } from "@tanstack/react-router";

export default function SaleBanner() {
    return (
        <div className="bg-accent border-b border-accent/20 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-accent-foreground shrink-0" />
                <span className="text-sm font-medium text-accent-foreground">
                    Mid-season sale — up to 70% off
                </span>
            </div>
            <Link to="/collections" className="text-xs font-semibold text-accent shrink-0 ml-3">
                Shop →
            </Link>
        </div>
    );
}