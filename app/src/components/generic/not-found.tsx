import { Home, ArrowLeft, Search } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { LucideIcon } from "lucide-react";

interface QuickLink {
    to: string;
    label: string;
}

interface NotFoundProps {
    icon?: LucideIcon;
    eyebrow?: string;
    title?: string;
    description?: string;
    showSearch?: boolean;
    primaryAction?: { label: string; to: string };
    showBackButton?: boolean;
    quickLinks?: QuickLink[];
    className?: string;
    variant?: "full" | "auto"
}

const DEFAULT_LINKS: QuickLink[] = [
    { to: "/collections", label: "Collections" },
    { to: "/collections/trending", label: "Trending" },
    { to: "/collections/new-arrivals", label: "New arrivals" },
    { to: "/contact", label: "Contact" },
];

export default function NotFound({
    icon: Icon,
    eyebrow = "Error 404",
    title = "Page not found",
    description = "The page you're looking for doesn't exist or has been moved.",
    showSearch = false,
    primaryAction = { label: "Go to homepage", to: "/" },
    showBackButton = true,
    quickLinks = DEFAULT_LINKS,
    variant = "full",
    className,
}: NotFoundProps) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate({ to: `/search/${encodeURIComponent(searchQuery)}` });
        }
    };

    return (
        <div className={cn("bg-background flex items-center justify-center p-4", variant == "full" ? "h-vhc" : "h-auto py-12", className)}>
            <div className="max-w-md w-full text-center">
                {Icon && (
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-secondary flex items-center justify-center">
                        <Icon className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                )}

                <span className="inline-block text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                    {eyebrow}
                </span>

                <h1 className="text-xl font-semibold mb-2">{title}</h1>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{description}</p>

                {showSearch && (
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search for products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-20"
                            />
                            <Button type="submit" size="sm" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full">
                                Search
                            </Button>
                        </div>
                    </form>
                )}

                <div className="flex flex-col sm:flex-row gap-2 justify-center mb-6">
                    <Button onClick={() => navigate({ to: primaryAction.to })} className="rounded-full gap-2">
                        <Home className="w-4 h-4" />
                        {primaryAction.label}
                    </Button>
                    {showBackButton && (
                        <Button
                            variant="outline"
                            className="rounded-full gap-2"
                            onClick={(e) => {
                                e.preventDefault();
                                window.history.back();
                            }}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go back
                        </Button>
                    )}
                </div>

                {quickLinks.length > 0 && (
                    <div className="pt-6 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-3">Popular destinations</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="px-3 py-1.5 text-xs font-medium rounded-full border border-border hover:bg-muted transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}