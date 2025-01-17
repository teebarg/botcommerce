"use client";

import React from "react";
import { Customer } from "types/global";

import { bulkUploadProducts } from "../actions";
import { Excel } from "../components/file-uploader";

interface CollectionProps {
    customer: Customer;
}

const CollectionUpload: React.FC<CollectionProps> = ({ customer }) => {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS}/api/ws/${customer.id}/`;

    const handleUpload = async (formData: any) => {
        await bulkUploadProducts({ formData });
    };

    return <Excel wsUrl={wsUrl} onUpload={handleUpload} />;
};

export default CollectionUpload;
