"use client";

import React from "react";

import { Excel } from "../components/file-uploader";

import { User } from "@/lib/models";
import { api } from "@/apis";

interface CollectionProps {
    customer: User;
}

const CollectionUpload: React.FC<CollectionProps> = ({ customer }) => {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS}/api/ws/${customer.id}/`;

    const handleUpload = async (formData: FormData) => {
        await api.product.bulkUpload(formData);
    };

    return <Excel wsUrl={wsUrl} onUpload={handleUpload} />;
};

export default CollectionUpload;
