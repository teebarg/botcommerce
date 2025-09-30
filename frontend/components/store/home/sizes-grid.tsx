"use client";

import { useRouter } from "next/navigation";

const sizes = [
    {
        id: 1,
        size: "8",
        color: "bg-gradient-to-br from-indigo-500/20 to-indigo-500/5",
        textColor: "text-indigo-500",
    },
    {
        id: 2,
        size: "10",
        color: "bg-gradient-to-br from-blue-500/30 to-blue-500/10",
        textColor: "text-blue-500",
    },
    {
        id: 3,
        size: "12",
        color: "bg-gradient-to-br from-green-500/30 to-green-500/10",
        textColor: "text-green-500",
    },
    {
        id: 4,
        size: "14",
        color: "bg-gradient-to-br from-yellow-500/50 to-yellow-500/20",
        textColor: "text-yellow-500",
    },
    {
        id: 5,
        size: "16",
        color: "bg-gradient-to-br from-orange-500/50 to-orange-500/20",
        textColor: "text-orange-500",
    },
    {
        id: 6,
        size: "18",
        color: "bg-gradient-to-br from-pink-500/10 to-pink-500/5",
        textColor: "text-pink-500",
    },
    {
        id: 7,
        size: "20",
        color: "bg-gradient-to-br from-indigo-500/20 to-indigo-500/10",
        textColor: "text-indigo-500",
    },
    {
        id: 8,
        size: "22",
        color: "bg-gradient-to-br from-indigo-500/10 to-indigo-500/5",
        textColor: "text-indigo-500",
    },
];

const SizesGrid = () => {
    const router = useRouter();

    return (
        <section className="py-16 bg-secondary/30 px-4 md:px-2">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-3">Shop by Size</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Find your perfect fit with our size-specific collections</p>
                </div>

                <div className="grid grid-cols-4 lg:grid-cols-8 gap-4">
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
                                    <div className={`text-3xl font-bold ${size.textColor} mb-1`}>{size.size}</div>
                                    <div className="text-xs text-muted-foreground font-medium">UK Size</div>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SizesGrid;
