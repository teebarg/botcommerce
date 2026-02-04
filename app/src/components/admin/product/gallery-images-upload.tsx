import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useBulkUploadImages, useReIndexGallery } from "@/hooks/useGallery";

declare global {
    interface Window {
        cloudinary: any;
    }
}

export function GalleryImagesUpload() {
    const { mutateAsync: reIndexGallery, isPending: isReIndexing } = useReIndexGallery();
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isCloudinaryLoaded, setIsCloudinaryLoaded] = useState(false);

    const { mutateAsync: bulkUpload, isPending } = useBulkUploadImages();

    useEffect(() => {
        if (typeof window !== "undefined" && !window.cloudinary) {
            const script = document.createElement("script");
            script.src = "https://upload-widget.cloudinary.com/global/all.js";
            script.async = true;
            script.onload = () => setIsCloudinaryLoaded(true);
            document.body.appendChild(script);
        } else if (window.cloudinary) {
            setIsCloudinaryLoaded(true);
        }
    }, []);

    const onComplete = async () => {
        await bulkUpload({ urls: imageUrls });
        setImageUrls([]);
    };

    const openImageUpload = () => {
        if (!window.cloudinary) return;

        const widget = window.cloudinary.createUploadWidget(
            {
                cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
                uploadPreset: "shop_test",
                clientAllowedFormats: ["image"],
                multiple: true,
            },
            (error: any, result: any) => {
                if (!error && result && result.event === "success") {
                    setImageUrls((prev) => [...prev, result.info.secure_url]);
                }
            }
        );
        widget.open();
    };

    const openVideoUpload = () => {
        if (!window.cloudinary) return;

        const widget = window.cloudinary.createUploadWidget(
            {
                cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
                uploadPreset: "shop_test_video",
                clientAllowedFormats: ["video"],
                multiple: true,
                maxFileSize: 2000000, // 2MB before transformation
            },
            (error: any, result: any) => {
                if (!error && result && result.event === "success") {
                    setImageUrls((prev) => [...prev, result.info.secure_url]);
                }
            }
        );
        widget.open();
    };

    return (
        <div className="flex gap-2 flex-wrap mb-4">
            <Button variant="outline" onClick={openImageUpload} disabled={!isCloudinaryLoaded}>
                Upload Images
            </Button>

            <Button variant="outline" onClick={openVideoUpload} disabled={!isCloudinaryLoaded}>
                Upload Videos
            </Button>

            {imageUrls.length > 0 && (
                <Button disabled={isPending} onClick={onComplete}>
                    {isPending ? "Saving..." : "Complete"}
                </Button>
            )}
            <Button className="min-w-32" disabled={isReIndexing} isLoading={isReIndexing} variant="emerald" onClick={() => reIndexGallery()}>
                Re-index
            </Button>
        </div>
    );
}
