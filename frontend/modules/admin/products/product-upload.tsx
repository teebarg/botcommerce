"use client";

import React from "react";

import { bulkUploadProducts } from "../actions";
import { Excel } from "../components/file-uploader";

interface ProductUploadProps {
    userId: string | number;
}

const ProductUpload: React.FC<ProductUploadProps> = ({ userId }) => {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS}/api/ws/${userId}/`;

    const handleUpload = async (formData: any) => {
        await bulkUploadProducts({ formData });
    };

    return <Excel wsUrl={wsUrl} onUpload={handleUpload} />;
};

export default ProductUpload;
