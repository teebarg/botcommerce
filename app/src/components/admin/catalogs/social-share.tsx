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
                <Button className="h-10 w-10 rounded-full bg-accent/10 backdrop-blur-sm hover:bg-accent/20" size="icon" variant="ghost">
                    <Share className="h-5 w-5 text-accent" />
                </Button>
            }
        />
    );
}
