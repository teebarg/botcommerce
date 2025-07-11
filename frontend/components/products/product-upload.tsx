"use client";

import React, { useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { useWebSocket } from "@/providers/websocket";
import { getCookie } from "@/lib/util/server-utils";

interface ProductUploadProps {}

const ProductUpload: React.FC<ProductUploadProps> = () => {
    const { currentMessage } = useWebSocket();

    useEffect(() => {
        if (!currentMessage) return;
        if (currentMessage?.message_type === "sheet-processor" && currentMessage?.status === "completed") {
            toast.success("Products uploaded successfully");
        }
    }, [currentMessage]);

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
                const accessToken = await getCookie("access_token");

                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/upload-products/`, {
                        method: "POST",
                        body: formData,
                        headers: { "X-Auth": accessToken ?? "" },
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
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${isDragActive ? "border-blue-500 bg-blue-50" : "border-default-300 hover:border-default-400"}`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-default-500" />
                    <p className="text-default-900">{isDragActive ? "Drop the file here" : "Drag & drop file or click to upload"}</p>
                    <p className="text-sm text-default-500">(Max 5MB, XLSX/CSV only)</p>
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
            </div>
            <div className="text-xs text-default-500">
                <p>• Only .xlsx files are allowed</p>
            </div>
        </div>
    );
};

export default ProductUpload;
