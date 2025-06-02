"use client";

import React from "react";
import { notFound } from "next/navigation";
import { RefreshCw, Truck } from "lucide-react";

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
            <div className="text-sm py-8 bg-yellow-50/90 text-yellow-950 -mx-2 px-2 rounded-none md:rounded-lg">
                <div className="grid grid-cols-1 gap-y-8">
                    <div className="flex items-start gap-x-2">
                        <Truck className="text-default-foreground" size={16} />
                        <div>
                            <span className="font-semibold">Fast delivery</span>
                            <p className="max-w-sm">
                                Your package will arrive in 3-5 business days at your pick up location or in the comfort of your home.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-x-2">
                        <RefreshCw />
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
