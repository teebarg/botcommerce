import { currency } from "@/utils";
import LazyImage from "./LazyImage";

export default function ProductGridItem({ product, isSelected, onToggle, onOpen }) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="relative" onClick={onOpen}>
                <LazyImage src={product.image} alt={product.name} aspect="4/5" />

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
            </div>
            <div className="mt-2 px-0.5">
                <p className="font-mono text-xs font-semibold text-stone-700">{currency(product.price)}</p>
            </div>
        </div>
    );
}
