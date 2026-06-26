import { useState, useEffect, useRef } from "react";
import { ImagePlus, Video, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBulkUploadImages } from "@/hooks/useGallery";

declare global {
    interface Window { cloudinary: any; }
}

export function GalleryImagesUpload() {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isCloudinaryLoaded, setIsCloudinaryLoaded] = useState(false);
    const [openingType, setOpeningType] = useState<"image" | "video" | null>(null);
    const imageWidgetRef = useRef<any>(null);
    const videoWidgetRef = useRef<any>(null);
    const { mutateAsync: bulkUpload, isPending } = useBulkUploadImages();

    useEffect(() => {
        if (window.cloudinary) { setIsCloudinaryLoaded(true); return; }
        const script = document.createElement("script");
        script.src = "https://upload-widget.cloudinary.com/global/all.js";
        script.async = true;
        script.onload = () => setIsCloudinaryLoaded(true);
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); };
    }, []);

    useEffect(() => {
        if (!isCloudinaryLoaded || imageWidgetRef.current) return;
        const uploadCallback = (error: any, result: any) => {
            if (error) return;
            if (result?.event === "success") setImageUrls((prev) => [...prev, result.info.secure_url]);
            if (result?.event === "close") setOpeningType(null);
        };
        imageWidgetRef.current = window.cloudinary.createUploadWidget(
            { cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME, uploadPreset: "shop_test", clientAllowedFormats: ["image"], multiple: true },
            uploadCallback
        );
        videoWidgetRef.current = window.cloudinary.createUploadWidget(
            { cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME, uploadPreset: "shop_test_video", clientAllowedFormats: ["video"], multiple: true, maxFileSize: 2000000 },
            uploadCallback
        );
    }, [isCloudinaryLoaded]);

    const openImageUpload = () => { if (!imageWidgetRef.current) return; setOpeningType("image"); imageWidgetRef.current.open(); };
    const openVideoUpload = () => { if (!videoWidgetRef.current) return; setOpeningType("video"); videoWidgetRef.current.open(); };
    const onComplete = async () => { await bulkUpload({ urls: imageUrls }); setImageUrls([]); };

    return (
        <div className="flex items-center gap-1.5 shrink-0">
            <Button
                size="sm"
                variant="ghost"
                className="border border-border text-muted-foreground hover:text-foreground gap-1.5"
                disabled={!isCloudinaryLoaded || openingType === "image"}
                onClick={openImageUpload}
            >
                <ImagePlus className="h-4 w-4" />
                {openingType === "image" ? "Opening..." : "Images"}
            </Button>
            <Button
                size="sm"
                variant="ghost"
                className="border border-border text-muted-foreground hover:text-foreground gap-1.5"
                disabled={!isCloudinaryLoaded || openingType === "video"}
                onClick={openVideoUpload}
            >
                <Video className="h-4 w-4" />
                {openingType === "video" ? "Opening..." : "Videos"}
            </Button>
            {imageUrls.length > 0 && (
                <Button
                    size="sm"
                    variant="ghost"
                    className="bg-success text-success-foreground gap-1.5"
                    disabled={isPending}
                    onClick={onComplete}
                >
                    <Check className="h-4 w-4" />
                    {isPending ? "Saving..." : `Save ${imageUrls.length}`}
                </Button>
            )}
        </div>
    );
}