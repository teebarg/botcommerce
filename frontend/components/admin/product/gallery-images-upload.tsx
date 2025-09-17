import { useOverlayTriggerState } from "@react-stately/overlays";

import { Button } from "@/components/ui/button";
import SupabaseUploader from "@/components/generic/supabase-upload-button";
import { useBulkUploadImages } from "@/lib/hooks/useGallery";
import FirebaseUploader from "@/components/generic/firebase-uploader";

export function GalleryImagesUpload() {
    const editState = useOverlayTriggerState({});
    const firebaseState = useOverlayTriggerState({});

    const { mutateAsync: bulkUpload, isPending } = useBulkUploadImages();

    const handleUpload = async (urls: string[]) => {
        await bulkUpload({ urls });
        editState.close();
        firebaseState.close();
    };

    return (
        <div className="space-y-6 flex gap-2">
            <Button variant="indigo" onClick={editState.open}>
                Upload Images
            </Button>
            <Button variant="indigo" onClick={firebaseState.open}>
                Upload to Firebase
            </Button>
            {editState.isOpen && (
                <SupabaseUploader bucket="product-images" isUploading={isPending} onClose={editState.close} onComplete={handleUpload} />
            )}
            {firebaseState.isOpen && <FirebaseUploader isUploading={isPending} onClose={firebaseState.close} onComplete={handleUpload} />}
        </div>
    );
}
