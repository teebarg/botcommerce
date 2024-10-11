"use client";

import React from "react";

import { bulkUploadProducts } from "../actions";
import { Excel } from "../components/file-uploader";

interface ProductUploadProps {}

const ProductUpload: React.FC<ProductUploadProps> = () => {
    const id = "sheet";
    const wsUrl = `${process.env.NEXT_PUBLIC_WS}/api/ws/upload/${id}`;

    const handleUpload = async (id: string, formData: any) => {
        await bulkUploadProducts({ formData });
    };

    return (
        <div className="">
            <Excel wsUrl={wsUrl} onUpload={handleUpload} />
        </div>
    );
};

export default ProductUpload;
