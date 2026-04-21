import { ProductSearch } from "@/schemas";

interface ProductTagProps {
    product: ProductSearch;
}

const ProductTag = ({ product }: ProductTagProps) => {
    const variant = product.variants?.[0];
    const accentColor = variant?.color ?? "transparent";
    const content = (() => {
        if (variant?.width || variant?.length) {
            return (
                <div className="text-[0.85rem]">
                    {variant.width && <div>W-{variant.width}</div>}
                    {variant.length && <div>L-{variant.length}</div>}
                </div>
            );
        }
        if (variant?.age) {
            return <div className="py-1 text-xs">{variant?.age}</div>;
        }
        if (variant?.size) {
            return (
                <div className="text-[10px]">
                    uk<span className="text-base">{variant.size}</span>
                </div>
            );
        }
        return null;
    })();

    if (!content) return null;

    if (variant?.width || variant?.length) {
        return (
            <div className="absolute -right-1 top-6 z-10 origin-top-right transition-transform duration-300 group-hover:rotate-3">
                <div className="absolute -top-4 right-4 w-px h-4 bg-foreground" />
                <div className="absolute -top-5 right-3 w-3 h-3 rounded-full border border-foreground bg-background" />
                <div
                    className="relative bg-background text-foreground border-border border-l-[3px] px-2 py-1 font-display text-xs uppercase"
                    style={{ borderLeftColor: accentColor }}
                >
                    {content}
                </div>
            </div>
        );
    }

    return (
        <div className="absolute right-0 top-0">
            <div
                className="relative bg-amber-500 text-white border-border border-l-[3px] px-2 font-semibold uppercase"
                style={{ borderLeftColor: accentColor }}
            >
                {content}
            </div>
        </div>
    );
};

export default ProductTag;
