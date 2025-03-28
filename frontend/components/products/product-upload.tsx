import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// import { api } from "@/apis";
import { bulkUpload } from "@/modules/account/actions";

interface ProductUploadProps {}

const ProductUpload: React.FC<ProductUploadProps> = () => {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState<boolean>(false);

    // Dropzone configuration
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
            // formData.append("batch", "batch1");

            void (async () => {
                try {
                    // await api.product.bulkUpload(formData);
                    await bulkUpload(formData);
                    toast.success("Product uploaded successfully");
                    router.refresh();
                } catch (error) {
                    toast.error(`Error - ${error as string}`);
                } finally {
                    setIsUploading(false);
                }
            })();
        },
    });

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-default-500" />
                    <p className="text-default-600">{isDragActive ? "Drop the images here" : "Drag & drop images or click to upload"}</p>
                    <p className="text-sm text-default-400">(Max 5MB, JPG/PNG/GIF only)</p>
                    {/* Upload progress */}
                    {isUploading && (
                        <div className="mb-4">
                            <div className="w-full bg-default-200 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${52}%` }} />
                            </div>
                            <p className="text-sm text-blue-500 mt-1">Uploading...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Help text */}
            <div className="text-xs text-default-500">
                <p>• Only .xlsx files are allowed</p>
            </div>
        </div>
    );
};

export default ProductUpload;
