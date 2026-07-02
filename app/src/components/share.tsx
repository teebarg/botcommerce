import { toast } from "sonner";
import { Share2 } from "lucide-react";
import { ShareUI } from "@/utils/reuseable";
import { useLocation } from "@tanstack/react-router";

interface ShareButtonProps {
    text?: string;
}

export default function ShareButton({ text = "Check out these products in our catalog" }: ShareButtonProps) {
    const location = useLocation();
    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Product Catalog",
                    text: "Check out these products in our catalog",
                    url: location.url,
                });
            } catch (error: any) {
                if (error.name !== "AbortError") {
                    toast.error("Share Failed", {
                        description: "Unable to share via native sharing.",
                    });
                }
            }
        }
    };

    return (
        <ShareUI
            handleNativeShare={handleNativeShare}
            targetUrl={location.url}
            text={text}
            trigger={
                <button className="w-12 h-12 rounded-full glass3 shadow-md flex items-center justify-center text-foreground">
                    <Share2 className="h-5 w-5" />
                </button>
            }
        />
    );
}
