"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useBulkUploadImages } from "@/lib/hooks/useGallery";

export function GalleryImagesUpload() {
    // const editState = useOverlayTriggerState({});
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    const { mutateAsync: bulkUpload, isPending } = useBulkUploadImages();

    // const handleUpload = async (urls: string[]) => {
    //     await bulkUpload({ urls });
    //     editState.close();
    // };

    const onComplete = async () => {
        await bulkUpload({ urls: imageUrls });
        setImageUrls([]);
    };

    return (
        <div className="space-y-6 flex gap-2 flex-wrap">
            {/* <Button onClick={editState.open}>
                Upload Images
            </Button> */}
            <CldUploadWidget
                uploadPreset="shop_test"
                options={{
                    clientAllowedFormats: ["image"],
                    multiple: true,
                }}
                onSuccess={(result: any) => {
                    if (result.event === "success") {
                        setImageUrls((prev) => [...prev, result.info.secure_url]);
                    }
                }}
            >
                {({ open }) => {
                    return (
                        <Button variant="outline" onClick={() => open()}>
                            Upload Images
                        </Button>
                    );
                }}
            </CldUploadWidget>
            <CldUploadWidget
                uploadPreset="shop_test_video"
                options={{
                    clientAllowedFormats: ["video"],
                    multiple: true,
                    maxFileSize: 2000000, // 2MB before transformation
                }}
                onSuccess={(result: any) => {
                    if (result.event === "success") {
                        setImageUrls((prev) => [...prev, result.info.secure_url]);
                    }
                }}
            >
                {({ open }) => (
                    <Button variant="outline" onClick={() => open()}>
                        Upload Videos
                    </Button>
                )}
            </CldUploadWidget>
            {imageUrls.length > 0 && (
                <Button disabled={isPending} onClick={onComplete}>
                    {isPending ? "Saving..." : "Complete"}
                </Button>
            )}
            {/* {editState.isOpen && (
                <SupabaseUploader bucket="product-images" isUploading={isPending} onClose={editState.close} onComplete={handleUpload} />
            )} */}
        </div>
    );
}
