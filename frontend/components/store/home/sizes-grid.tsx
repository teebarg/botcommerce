"use client";

import { useRouter } from "next/navigation";

const sizes = [
    {
        id: 1,
        size: "8",
        color: "bg-gradient-to-br from-campaign-primary/20 to-campaign-primary/5",
        textColor: "text-campaign-primary",
    },
    {
        id: 2,
        size: "10",
        color: "bg-gradient-to-br from-primary/20 to-primary/5",
        textColor: "text-primary",
    },
    {
        id: 3,
        size: "12",
        color: "bg-gradient-to-br from-campaign-primary/20 to-campaign-primary/5",
        textColor: "text-campaign-primary",
    },
    {
        id: 4,
        size: "14",
        color: "bg-gradient-to-br from-accent/20 to-accent/5",
        textColor: "text-accent-foreground",
    },
    {
        id: 5,
        size: "16",
        color: "bg-gradient-to-br from-primary/20 to-primary/5",
        textColor: "text-primary",
    },
    {
        id: 6,
        size: "18",
        color: "bg-gradient-to-br from-secondary/20 to-secondary/5",
        textColor: "text-secondary-foreground",
    },
    {
        id: 7,
        size: "20",
        color: "bg-gradient-to-br from-accent/20 to-accent/5",
        textColor: "text-accent-foreground",
    },
    {
        id: 8,
        size: "22",
        color: "bg-gradient-to-br from-muted/40 to-muted/10",
        textColor: "text-muted-foreground",
    },
];

const SizesGrid = () => {
    const router = useRouter();
    return (
        <section className="py-16 bg-secondary/30 px-4 md:px-2">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4">Shop by Size</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Find your perfect fit with our size-specific collections</p>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {sizes.map((size) => (
                        <div
                            key={size.id}
                            className={`group relative overflow-hidden rounded-xl ${size.color} border border-border/50 hover:border-border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg`}
                            onClick={() => {
                                router.push(`/collections?sizes=${size.size}`);
                            }}
                        >
                            <div className="py-6 text-center">
                                <div>
                                    <div className={`text-4xl font-bold ${size.textColor} mb-1`}>{size.size}</div>
                                    <div className="text-xs text-muted-foreground font-medium">UK Size</div>
                                </div>
                            </div>

                            {/* Hover effect */}
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SizesGrid;
