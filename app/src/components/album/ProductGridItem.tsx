import { currency } from "@/utils";
import LazyImage from "./LazyImage";
import { Badge } from "@/components/ui/badge";

interface ProductGridItemProps {
    product: any;
    isSelected: boolean;
    onToggle: (id: number) => void;
    onOpen: () => void;
}

export default function ProductGridItem({ product, isSelected, onToggle, onOpen }: ProductGridItemProps) {
    const outOfStock = product.status === "OUT_OF_STOCK";

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="relative cursor-pointer" onClick={onOpen}>
                <div className={outOfStock ? "opacity-60 grayscale" : ""}>
                    <LazyImage src={product.image} alt={product.name} aspect="4/5" />
                </div>

                {!outOfStock && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle(product.id);
                        }}
                        aria-label={isSelected ? "Remove from selection" : "Add to selection"}
                        className={`absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full border text-base backdrop-blur-md transition-all duration-300 ${
                            isSelected ? "border-white bg-white text-stone-900" : "border-white/40 bg-black/20 text-white"
                        }`}
                    >
                        {isSelected ? "✓" : "+"}
                    </button>
                )}

                <Badge className="absolute top-2 left-2" variant="accent">
                    {currency(product.price)}
                </Badge>

                {outOfStock && (
                    <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-stone-900 backdrop-blur-sm">
                        Out of stock
                    </span>
                )}
            </div>
        </div>
    );
}
