import { currency } from "@/utils";
import { Badge } from "@/components/ui/badge";
import LazyImage from "./LazyImage";

export default function ProductCard({ product, isSelected, onToggle }: { product: any; isSelected: boolean; onToggle: (id: number) => void }) {
    const outOfStock = product.status === "OUT_OF_STOCK";

    const handleToggle = () => {
        if (outOfStock) return;
        onToggle(product.id);
    };

    return (
        <section id={`product-${product.id}`} className="scroll-mt-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div onClick={handleToggle} className={`relative ${outOfStock ? "cursor-not-allowed" : "cursor-pointer"}`}>
                <div className={outOfStock ? "opacity-60 grayscale" : ""}>
                    <LazyImage src={product.image} alt={product.name} aspect="4/5" />
                </div>

                {outOfStock ? (
                    <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-stone-900 backdrop-blur-sm">
                        Out of stock
                    </span>
                ) : (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggle();
                        }}
                        aria-label={isSelected ? "Remove from selection" : "Add to selection"}
                        className={`absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full text-lg backdrop-blur-md transition-all duration-300 ${
                            isSelected ? "bg-emerald-800 text-white shadow-md" : "border border-white/40 bg-black/20 text-white hover:bg-black/30"
                        }`}
                    >
                        {isSelected ? "✓" : "+"}
                    </button>
                )}

                <Badge className="absolute top-3 left-2 text-base" variant="accent">
                    {currency(product.price)}
                </Badge>

                {isSelected && !outOfStock && (
                    <span className="absolute bottom-4 left-4 rounded-full bg-stone-900/80 px-3 py-1 text-[11px] uppercase tracking-widest text-white backdrop-blur-sm">
                        Selected
                    </span>
                )}
            </div>
        </section>
    );
}
