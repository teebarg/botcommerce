"use client";

import React from "react";
import { notFound } from "next/navigation";
import FastDelivery from "@modules/common/icons/fast-delivery";
import Refresh from "@modules/common/icons/refresh";
// import Back from "@modules/common/icons/back";

import { Product } from "@/types/models";

type ProductDetailsProps = {
    product: Product;
};

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
    if (!product) {
        return notFound();
    }

    return (
        <React.Fragment>
            <div className="text-sm py-8 bg-yellow-50/80 md:bg-content1 -mx-2 px-2 rounded-none md:rounded-lg text-gray-900 md:text-default-foreground">
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
                        {/* <Back /> */}
                        <div>
                            <span className="font-semibold">Easy returns</span>
                            <p className="max-w-sm">
                                Just return your product and we&apos;ll refund your money. No questions asked – we&apos;ll do our best to make sure
                                your return is hassle-free.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default ProductDetails;
