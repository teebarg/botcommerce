"use client";

import React, { useEffect, useState } from "react";
import { useCookie } from "@lib/hooks/use-cookie";

import { bulkUploadProducts } from "../actions";
import { Excel } from "../components/file-uploader";

interface CollectionProps {}

const CollectionUpload: React.FC<CollectionProps> = () => {
    const { getCookie, setCookie } = useCookie();
    const [wsCookie, setWsCookie] = useState<string>(() => getCookie("_ws_cookie") || "");

    useEffect(() => {
        const acceptCookie = getCookie("_ws_cookie");

        if (acceptCookie) {
            setWsCookie(acceptCookie);

            return;
        }
        setCookie("_ws_cookie", Math.random().toString(36).substr(2, 9));
        setWsCookie(Math.random().toString(36).substr(2, 9));
    }, []);

    const wsUrl = `${process.env.NEXT_PUBLIC_WS}/api/ws/upload/${wsCookie}`;

    const handleUpload = async (formData: any) => {
        await bulkUploadProducts({ formData });
    };

    return (
        <div className="">
            <Excel wsUrl={wsUrl} onUpload={handleUpload} />
        </div>
    );
};

export default CollectionUpload;
