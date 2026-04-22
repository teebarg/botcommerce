import { toast } from "sonner";
import { Share2 } from "lucide-react";
import { ShareUI } from "@/utils/reuseable";

interface ShareButtonProps {
    text?: string;
}

export default function ShareButton({ text = "Check out these products in our catalog" }: ShareButtonProps) {
    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Product Catalog",
                    text: "Check out these products in our catalog",
                    url: window.location.href,
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
            targetUrl={window.location.href}
            text={text}
            trigger={
                <button className="z-30">
                    <span className="hidden md:inline-flex items-center gap-1 px-3 py-2 rounded-md bg-contrast text-contrast-foreground cursor-pointer">
                        <Share2 className="h-4 w-4" />
                        Share
                    </span>
                    <span className="md:hidden flex flex-col items-center text-white/80">
                        <div className="action-button">
                            <Share2 className="w-4 h-4" fill="currentColor" />
                        </div>
                    </span>
                </button>
            }
        />
    );
}
