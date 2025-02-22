"use client";

import React from "react";

import { bulkUploadProducts } from "../actions";
import { Excel } from "../components/file-uploader";
import { User } from "@/lib/models";

interface CollectionProps {
    customer: User;
}

const CollectionUpload: React.FC<CollectionProps> = ({ customer }) => {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS}/api/ws/${customer.id}/`;

    const handleUpload = async (formData: any) => {
        await bulkUploadProducts({ formData });
    };

    return <Excel wsUrl={wsUrl} onUpload={handleUpload} />;
};

export default CollectionUpload;
