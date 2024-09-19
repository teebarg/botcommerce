import { CartIcon } from "nui-react-icons";
import ItemsPreviewTemplate from "@modules/cart/templates/preview";
import Button from "@modules/common/components/button";

interface ComponentProps {
    cartItems: any;
    region: any;
}

const EmptyCartState = () => {
    return (
        <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-sm h-full">
            <CartIcon className="w-20 h-20 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-default-800 mb-2">Your cart is empty</h2>
            <p className="text-default-500 text-center mb-6">{`Looks like you haven't added anything to your cart yet.`}</p>
            <Button color="secondary" variant="shadow">
                Start Shopping
            </Button>
        </div>
    );
};

const CartItems: React.FC<ComponentProps> = ({ cartItems, region }) => {
    if (cartItems?.length == 0) {
        return <EmptyCartState />;
    }

    return (
        <div className="w-full rounded-medium bg-content2 px-2 py-4 dark:bg-content1 lg:flex-none max-h-full overflow-auto">
            <div>
                <h2 className="font-medium text-default-500">Your Cart</h2>
                <hr className="tb-divider mt-4" />
                <ItemsPreviewTemplate items={cartItems} />
            </div>
        </div>
    );
};

export { CartItems };
