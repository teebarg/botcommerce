import LazyImage from "./LazyImage";

export default function ProductCard({ product, isSelected, onToggle }: { product: any; isSelected: boolean; onToggle: (id: number) => void }) {
    return (
        <section id={`product-${product.id}`} className="scroll-mt-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div onClick={() => onToggle(product.id)} className="relative">
                <LazyImage src={product.image} alt={product.name} aspect="4/5" />

                <button
                    onClick={() => onToggle(product.id)}
                    aria-label={isSelected ? "Remove from selection" : "Add to selection"}
                    className={`absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border text-lg backdrop-blur-md transition-all duration-300 ${
                        isSelected ? "border-white bg-white text-stone-900 shadow-md" : "border-white/40 bg-black/20 text-white hover:bg-black/30"
                    }`}
                >
                    {isSelected ? "✓" : "+"}
                </button>

                {isSelected && (
                    <span className="absolute bottom-4 left-4 rounded-full bg-stone-900/80 px-3 py-1 text-[11px] uppercase tracking-widest text-white backdrop-blur-sm">
                        Selected
                    </span>
                )}
            </div>
        </section>
    );
}
