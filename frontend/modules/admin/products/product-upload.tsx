"use client";

import React from "react";
import { Customer } from "types/global";

import { bulkUploadProducts } from "../actions";
import { Excel } from "../components/file-uploader";

interface ProductUploadProps {
    customer: Customer;
}

const ProductUpload: React.FC<ProductUploadProps> = ({ customer }) => {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS}/api/ws/${customer.id}/`;

    const handleUpload = async (formData: any) => {
        await bulkUploadProducts({ formData });
    };

    return (
        <div className="">
            <Excel wsUrl={wsUrl} onUpload={handleUpload} />
        </div>
    );
};

export default ProductUpload;
