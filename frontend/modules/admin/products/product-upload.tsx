"use client";

import React from "react";

import { bulkUploadProducts } from "../actions";
import { Excel } from "../components/file-uploader";
import { User } from "@/lib/models";

interface ProductUploadProps {
    customer: User;
}

const ProductUpload: React.FC<ProductUploadProps> = ({ customer }) => {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS}/api/ws/${customer.id}/`;

    const handleUpload = async (formData: any) => {
        await bulkUploadProducts({ formData });
    };

    return <Excel wsUrl={wsUrl} onUpload={handleUpload} />;
};

export default ProductUpload;
