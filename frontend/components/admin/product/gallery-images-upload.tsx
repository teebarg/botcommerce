import { useOverlayTriggerState } from "@react-stately/overlays";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import SupabaseUploader from "@/components/generic/supabase-upload-button";
import { useBulkSaveImageUrls } from "@/lib/hooks/useProduct";

export function GalleryImagesUpload() {
    const editState = useOverlayTriggerState({});
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const { mutateAsync: bulkSaveImageUrls } = useBulkSaveImageUrls();

    const handleUpload = async (urls: string[]) => {
        setIsUploading(true);
        await bulkSaveImageUrls({ urls });
        editState.close();
        setIsUploading(false);
    };

    return (
        <div className="space-y-6">
            <Button variant="indigo" onClick={editState.open}>
                Upload Images
            </Button>
            {editState.isOpen && (
                <SupabaseUploader bucket="product-images" isUploading={isUploading} onClose={editState.close} onComplete={handleUpload} />
            )}
        </div>
    );
}
