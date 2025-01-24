"use client";

import React from "react";
import { notFound } from "next/navigation";
import FastDelivery from "@modules/common/icons/fast-delivery";
import Refresh from "@modules/common/icons/refresh";
import Back from "@modules/common/icons/back";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "components/ui/accordion";

type ProductDetailsProps = {
    product: any;
};

const ProductInfoTab = ({ product }: ProductDetailsProps) => {
    return (
        <div className="text-sm py-8">
            <div className="grid grid-cols-2 gap-x-8">
                <div className="flex flex-col gap-y-4">
                    <div>
                        <span className="font-semibold">Material</span>
                        <p>{product.material ? product.material : "-"}</p>
                    </div>
                    <div>
                        <span className="font-semibold">Type</span>
                        <p>{product.type ? product.type.value : "-"}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-y-4">
                    <div>
                        <span className="font-semibold">Weight</span>
                        <p>{product.weight ? `${product.weight} g` : "-"}</p>
                    </div>
                    <div>
                        <span className="font-semibold">Dimensions</span>
                        <p>
                            {product.length && product.width && product.height ? `${product.length}L x ${product.width}W x ${product.height}H` : "-"}
                        </p>
                    </div>
                </div>
            </div>
            {product.tags?.length ? (
                <div>
                    <span className="font-semibold">Tags</span>
                </div>
            ) : null}
        </div>
    );
};

const ShippingInfoTab = () => {
    return (
        <div className="text-sm py-8">
            <div className="grid grid-cols-1 gap-y-8">
                <div className="flex items-start gap-x-2">
                    <FastDelivery />
                    <div>
                        <span className="font-semibold">Fast delivery</span>
                        <p className="max-w-sm">
                            Your package will arrive in 3-5 business days at your pick up location or in the comfort of your home.
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-x-2">
                    <Refresh />
                    <div>
                        <span className="font-semibold">Simple exchanges</span>
                        <p className="max-w-sm">Is the fit not quite right? No worries - we&apos;ll exchange your product for a new one.</p>
                    </div>
                </div>
                <div className="flex items-start gap-x-2">
                    <Back />
                    <div>
                        <span className="font-semibold">Easy returns</span>
                        <p className="max-w-sm">
                            Just return your product and we&apos;ll refund your money. No questions asked – we&apos;ll do our best to make sure your
                            return is hassle-free.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
    if (!product || !product.id) {
        return notFound();
    }

    return (
        <React.Fragment>
            <Accordion className="shadow-sm">
                <AccordionItem value="item-1">
                    <AccordionTrigger value="item-1">
                        <span className="text-left">Product Information</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4" value="item-1">
                        <ProductInfoTab product={product} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                    <AccordionTrigger value="item-2">
                        <span className="text-left">Shipping & Returns</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4" value="item-2">
                        <ShippingInfoTab />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </React.Fragment>
    );
};

export default ProductDetails;
