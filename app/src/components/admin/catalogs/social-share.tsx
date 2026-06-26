import { Share } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { DBCatalog } from "@/schemas";
import { ShareUI } from "@/utils/reuseable";

interface SocialShareProps {
    catalog: DBCatalog;
}

export function SocialShare({ catalog }: SocialShareProps) {
    const targetUrl = `${import.meta.env.VITE_BASE_URL}/catalog/${catalog.slug}`;

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: catalog.title,
                    text: `Check out this amazing ${catalog.title}`,
                    url: targetUrl,
                });
            } catch (err) {
                toast.error("Error sharing", { description: "Please try again" });
            }
        }
    };

    return (
        <ShareUI
            handleNativeShare={handleNativeShare}
            targetUrl={targetUrl}
            trigger={
                <Button className="rounded-full" size="icon" variant="outline">
                    <Share className="h-4 w-4" />
                </Button>
            }
        />
    );
}
