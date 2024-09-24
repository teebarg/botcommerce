"use client";

import React from "react";

import { bulkUploadProducts } from "../actions";
import { Excel } from "../components/file-uploader";

interface CollectionProps {}

const CollectionUpload: React.FC<CollectionProps> = () => {
    const id = "nK12eRTbo";

    // const domain = process.env.NODE_ENV === 'development' ? "ws://backend:4000" : `wss://${process.env.NEXT_PUBLIC_DOMAIN}`;
    const wsUrl = `${process.env.NEXT_PUBLIC_WS}/api/ws/upload/${id}`;

    const handleUpload = async (id: string, formData: any) => {
        await bulkUploadProducts({ id, formData });
    };

    return (
        <div className="">
            <Excel wsUrl={wsUrl} onUpload={handleUpload} />
        </div>
    );
};

export default CollectionUpload;
