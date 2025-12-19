import { Home, ArrowLeft, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function NotFound() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState<string>("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate({ to: `/search/${encodeURIComponent(searchQuery)}` });
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
            <div className="max-w-md w-full text-center animate-fade-in">
                <div className="relative mb-8">
                    <div className="w-32 h-32 mx-auto relative animate-float">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                <Package className="w-20 h-20 text-muted-foreground/40" strokeWidth={1.5} />
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-3xl font-bold text-primary/20">?</div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-2 border-dashed border-muted-foreground/10 animate-pulse-soft" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full border border-muted-foreground/5" />
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-4">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Error 404
                </div>

                <div className="space-y-4 mb-8">
                    <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
                    <p className="text-muted-foreground leading-relaxed">
                        The page you're looking for doesn't exist or has been moved. Try searching for what you need.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search for products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-4 py-6 text-base bg-secondary/50 border-border focus:bg-background transition-colors"
                        />
                        <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2">
                            Search
                        </Button>
                    </div>
                </form>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                    <Button
                        onClick={() => {
                            navigate({ to: "/" });
                        }}
                        className="gap-2 px-6 py-5 text-base font-medium"
                    >
                        <Home className="w-4 h-4" />
                        Go to Homepage
                    </Button>
                    <Button
                        variant="outline"
                        onClick={(e) => {
                            e.preventDefault();
                            window.history.back();
                        }}
                        className="gap-2 px-6 py-5 text-base font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </Button>
                </div>
                <div className="pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-3">Popular destinations</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {[
                            { to: "/collections", label: "Collections" },
                            { to: "/collections/trending", label: "Trending" },
                            { to: "/collections/new-arrivals", label: "New Arrivals" },
                            { to: "/contact", label: "Contact" },
                        ].map((link, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => navigate({ to: link.to })}
                                className="px-3 py-1.5 text-sm rounded-full bg-accent hover:bg-accent/80 text-accent-foreground transition-colors cursor-pointer"
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
