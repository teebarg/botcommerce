import ItemsPreviewTemplate from "@modules/cart/templates/preview";

import EmptyCartMessage from "@/modules/cart/components/empty-cart-message";
import { CartItem } from "@/types/models";

interface ComponentProps {
    items: CartItem[];
}

const CartItems: React.FC<ComponentProps> = ({ items }) => {
    if (!items || items?.length == 0) {
        return <EmptyCartMessage />;
    }

    return (
        <div className="w-full rounded-xl bg-content2 px-2 py-4 dark:bg-content1 lg:flex-none max-h-full overflow-auto">
            <div>
                <h2 className="font-medium text-default-500">Your Cart</h2>
                <hr className="tb-divider mt-4" />
                <ItemsPreviewTemplate className="max-h-[80vh]" items={items} />
            </div>
        </div>
    );
};

export { CartItems };
