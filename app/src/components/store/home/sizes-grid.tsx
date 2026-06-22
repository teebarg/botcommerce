import { Link } from "@tanstack/react-router";

const sizes = ["8", "10", "12", "14", "16", "18", "20", "22"];

export default function SizesGrid() {
    return (
        <section className="py-6 px-4 max-w-sxl mx-auto">
            <h2 className="font-display text-xl font-semibold mb-4">Shop by size</h2>
            <div className="flex flex-wrap gap-3">
                {sizes.map((size) => (
                    <Link
                        key={size}
                        to="/collections"
                        search={{ sizes: size }}
                        className="w-12 h-12 rounded-full border border-border flex flex-col items-center justify-center hover:bg-foreground hover:text-background hover:border-foreground transition-colors"
                    >
                        <span className="text-sm font-semibold leading-none">{size}</span>
                        <span className="text-[9px] text-muted-foreground leading-none mt-0.5">UK</span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
