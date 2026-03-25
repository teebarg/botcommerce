import { ProductSearch } from "@/schemas";

interface ProductTagProps {
    product: ProductSearch;
}

const ProductTag = ({ product }: ProductTagProps) => {
    const accentColor = product.colors[0] ?? "transparent";
    const content = (() => {
        if (product.ages.length > 0) {
            return <div>{product.ages[0]}</div>;
        }
        if (product.sizes.length > 0) {
            return (
                <div>
                    uk<span className="text-lg">{product.sizes[0]}</span>
                </div>
            );
        }
        return null;
    })();

    if (!content) return null;

    return (
        <div className="absolute -right-1 top-6 z-10 origin-top-right transition-transform duration-300 group-hover:rotate-3">
            {/* String/thread */}
            <div className="absolute -top-4 right-4 w-px h-4 bg-foreground" />
            <div className="absolute -top-5 right-3 w-3 h-3 rounded-full border border-foreground bg-background" />
            <div
                className="relative bg-background text-foreground border-border border-l-[3px] px-2 py-1 font-display text-xs uppercase"
                style={{ borderLeftColor: accentColor }}
            >
                <div className="border-t border-dashed border-border w-full" />
                {content}
            </div>
        </div>
    );
};

export default ProductTag;
