import { useOverlayTriggerState } from "@react-stately/overlays";
import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import SupabaseUploader from "@/components/generic/supabase-upload-button";
import { useBulkUploadImages } from "@/lib/hooks/useGallery";
import FirebaseUploader from "@/components/generic/firebase-uploader";

export function GalleryImagesUpload() {
    const editState = useOverlayTriggerState({});
    const firebaseState = useOverlayTriggerState({});
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    const { mutateAsync: bulkUpload, isPending } = useBulkUploadImages();

    const handleUpload = async (urls: string[]) => {
        await bulkUpload({ urls });
        editState.close();
        firebaseState.close();
    };

    const onComplete = async () => {
        await bulkUpload({ urls: imageUrls });
        setImageUrls([]);
    };

    return (
        <div className="space-y-6 flex gap-2">
            <Button variant="indigo" onClick={editState.open}>
                Upload Images
            </Button>
            <Button variant="indigo" onClick={firebaseState.open}>
                Upload to Firebase
            </Button>
            {/* <CldUploadButton
                options={{ multiple: true }}
                uploadPreset="shop_test"
                onClick={() => console.log("click")}
                onClose={() => console.log("close")}
                onCloseAction={() => console.log("closeAction")}
                onShowCompleted={() => console.log("showCompleted")}
                onShowCompletedAction={() => console.log("showCompletedAction")}
                onSuccess={(data) => console.log(data)}
                onUpload={(result: any) => {
                    if (result.event === "success") {
                        setImageUrls((prev) => [...prev, result.info.secure_url]);
                    }
                }}
            /> */}

            <CldUploadWidget
                options={{
                    maxFiles: 10, // allow multiple uploads
                    folder: "products", // organize into a folder
                    // transformation: [
                    //     { width: 1200, height: 1200, crop: "limit" }, // resize max 1200x1200
                    //     { quality: "auto" }, // auto quality
                    //     { fetch_format: "auto" }, // auto WebP/AVIF if supported
                    // ],
                }}
                uploadPreset="shop_test"
                onSuccess={(result: any) => {
                    if (result.event === "success") {
                        setImageUrls((prev) => [...prev, result.info.secure_url]);
                    }
                }}
            >
                {({ open }) => {
                    return (
                        <Button variant="indigo" onClick={() => open()}>
                            Upload an Image
                        </Button>
                    );
                }}
            </CldUploadWidget>
            {imageUrls.length > 0 && (
                <Button disabled={isPending} variant="indigo" onClick={onComplete}>
                    {isPending ? "Saving..." : "Save to Backend"}
                </Button>
            )}
            {editState.isOpen && (
                <SupabaseUploader bucket="product-images" isUploading={isPending} onClose={editState.close} onComplete={handleUpload} />
            )}
            {firebaseState.isOpen && <FirebaseUploader isUploading={isPending} onClose={firebaseState.close} onComplete={handleUpload} />}
        </div>
    );
}
