import { useOverlayTriggerState } from "@react-stately/overlays";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import SupabaseUploader from "@/components/generic/supabase-upload-button";
import { useBulkUploadImages } from "@/lib/hooks/useGallery";
import R2Uploader from "@/components/generic/r2-upload-button";
import FirebaseUploader from "@/components/generic/firebase-uploader";

export function GalleryImagesUpload() {
    const editState = useOverlayTriggerState({});
    const r2State = useOverlayTriggerState({});
    const firebaseState = useOverlayTriggerState({});
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const { mutateAsync: bulkUpload } = useBulkUploadImages();

    const handleUpload = async (urls: string[]) => {
        setIsUploading(true);
        await bulkUpload({ urls });
        editState.close();
        r2State.close();
        firebaseState.close();
        setIsUploading(false);
    };

    return (
        <div className="space-y-6 flex gap-2">
            <Button variant="indigo" onClick={editState.open}>
                Upload Images
            </Button>
            <Button variant="indigo" onClick={r2State.open}>
                Upload to R2
            </Button>
            <Button variant="indigo" onClick={firebaseState.open}>
                Upload to Firebase
            </Button>
            {editState.isOpen && (
                <SupabaseUploader bucket="product-images" isUploading={isUploading} onClose={editState.close} onComplete={handleUpload} />
            )}
            {r2State.isOpen && <R2Uploader isUploading={isUploading} onClose={r2State.close} onComplete={handleUpload} />}
            {firebaseState.isOpen && <FirebaseUploader isUploading={isUploading} onClose={firebaseState.close} onComplete={handleUpload} />}
        </div>
    );
}
