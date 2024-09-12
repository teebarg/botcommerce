import Button from "@modules/common/components/button";

const ProductOnboardingCta = () => {
    return (
        <div className="shadow-md max-w-4xl h-full bg-default-500 w-full p-8">
            <div className="flex flex-col gap-y-4 center">
                <p className="text-default-800 text-xl">Your demo product was successfully created! 🎉</p>
                <p className="text-default-600 text-sm">You can now continue setting up your store in the admin.</p>
                <a href="http://localhost:7001/a/orders?onboarding_step=create_order_nextjs">
                    <Button className="w-full">Continue setup in admin</Button>
                </a>
            </div>
        </div>
    );
};

export default ProductOnboardingCta;
