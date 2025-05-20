import { Category, Product } from "@/types/models";
import { currency } from "@/lib/util/util";

interface ProductListItemProps {
    product: Product;
    actions: React.ReactNode;
}

const ProductListItem = ({ product, actions }: ProductListItemProps) => {
    return (
        <div className="relative bg-content1 border border-default rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="h-40 w-full bg-content1 overflow-hidden relative">
                <img
                    alt={product.name}
                    className="h-full w-full object-cover"
                    src={product.images[0]?.image || product.image || "/placeholder.jpg"}
                />
                <div className="absolute top-2 right-2 bg-warning rounded-full py-1 px-2 text-xs text-white font-medium shadow-sm">
                    {product.variants?.[0]?.inventory ?? 0} in stock
                </div>
            </div>
            <div className="p-3 flex flex-col justify-end flex-1">
                <div className="text-sm text-primary font-medium mb-1">
                    {product.categories?.map((category: Category) => category.name).join(", ")}
                </div>
                <h3 className="font-medium text-default-900 mb-1 truncate">{product.name}</h3>
                <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">{currency(product.price)}</span>
                    <div className="flex space-x-1">{actions}</div>
                </div>
            </div>
        </div>
    );
};

export default ProductListItem;
