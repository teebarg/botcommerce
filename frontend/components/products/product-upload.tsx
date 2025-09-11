"use client";

import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { useWebSocket } from "@/providers/websocket";
import { Button } from "@/components/ui/button";
import { tryCatch } from "@/lib/try-catch";
import { api } from "@/apis/client";
import { Message } from "@/schemas";

interface ProductUploadProps {}

const ProductUpload: React.FC<ProductUploadProps> = () => {
    const { currentMessage } = useWebSocket();
    const [isSyncing, setIsSyncing] = useState<boolean>(false);

    useEffect(() => {
        if (!currentMessage) return;
        if (currentMessage?.type === "sheet-processor" && currentMessage?.status === "completed") {
            toast.success("Products uploaded successfully");
            setIsSyncing(false);
        }

        if (currentMessage?.type === "sheet-processor" && currentMessage?.status === "processing" && !isSyncing) {
            setIsSyncing(true);
        }
    }, [currentMessage]);

    const handleSyncProducts = async () => {
        setIsSyncing(true);
        const { error } = await tryCatch<Message>(api.post("/product/upload-products/"));

        if (error) {
            toast.error(error);
            setIsSyncing(false);

            return;
        }

        toast.success("Product update stated");
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        onDrop: (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];

            if (!file) return;

            const formData = new FormData();

            formData.append("file", file);

            void (async () => {
                const toastId = toast.loading("Uploading products...");

                try {
                    const response = await fetch("/api/product-upload", {
                        method: "POST",
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error("Failed to upload products");
                    }

                    toast.success("Product upload started", { id: toastId });
                } catch (error: any) {
                    toast.error(error.toString(), { id: toastId });
                }
            })();
        },
    });

    return (
        <div className="space-y-2">
            <Button disabled={isSyncing} isLoading={isSyncing} onClick={handleSyncProducts}>
                Sync Products from Sheet
            </Button>
            {currentMessage?.processed_rows < currentMessage?.total_rows && (
                <div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 animate-pulse"
                            style={{ width: `${(currentMessage?.processed_rows / currentMessage?.total_rows) * 100}%` }}
                        />
                    </div>
                    <p className="text-sm text-blue-500 mt-1">
                        Uploading... {currentMessage?.processed_rows || 0} of {currentMessage?.total_rows || 0}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProductUpload;
