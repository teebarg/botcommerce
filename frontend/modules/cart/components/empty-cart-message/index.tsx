import InteractiveLink from "@modules/common/components/interactive-link";

const EmptyCartMessage = () => {
    return (
        <div className="py-8 px-2 flex flex-col justify-center items-start" data-testid="empty-cart-message">
            <h1 className="flex flex-row text-2xl gap-x-2 items-baseline">Cart</h1>
            <p className="text-base mt-4 mb-6 max-w-[32rem]">
                You don&apos;t have anything in your cart. Let&apos;s change that, use the link below to start browsing our products.
            </p>
            <div>
                <InteractiveLink href="/collections">Explore products</InteractiveLink>
            </div>
        </div>
    );
};

export default EmptyCartMessage;
