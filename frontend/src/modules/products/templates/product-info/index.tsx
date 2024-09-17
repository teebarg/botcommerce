import LocalizedClientLink from "@modules/common/components/localized-client-link";

type ProductInfoProps = {
    product: any;
};

const ProductInfo = ({ product }: ProductInfoProps) => {
    return (
        <div id="product-info">
            <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
                {product.collection && (
                    <LocalizedClientLink
                        className="text-medium text-default-500 hover:text-default-600"
                        href={`/collections/${product.collection.slug}`}
                    >
                        {product.collection.title}
                    </LocalizedClientLink>
                )}
                <h2 className="text-3xl leading-10 text-default-800" data-testid="product-title">
                    {product.title}
                </h2>

                <p className="text-default-500" data-testid="product-description">
                    {product.description}
                </p>
            </div>
        </div>
    );
};

export default ProductInfo;
