"use client";

import React from "react";

import { Excel } from "../components/file-uploader";

import { api } from "@/apis";

interface ProductUploadProps {
    userId: number;
}

const ProductUpload: React.FC<ProductUploadProps> = ({ userId }) => {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS}/api/ws/${userId}/`;

    const handleUpload = async (formData: FormData) => {
        await api.product.bulkUpload(formData);
    };

    return <Excel wsUrl={wsUrl} onUpload={handleUpload} />;
};

export default ProductUpload;
