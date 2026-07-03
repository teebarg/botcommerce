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
                <button
                    className="h-12 w-12 rounded-full bg-gradient-action flex items-center justify-center active:scale-95 transition-transform"
                    aria-label="Share this page"
                >
                    <Share2 className="h-5 w-5 text-white" strokeWidth={2} />
                </button>
            }
        />
    );
}
