import { Facebook, Twitter, MessageCircle, Link, Share } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DBCatalog } from "@/schemas";
import { cn } from "@/lib/utils";

interface SocialShareProps {
    catalog: DBCatalog;
    className?: string;
}

export function SocialShare({ catalog, className }: SocialShareProps) {
    const targetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/shared/${catalog.slug}`;
    const shareUrl = encodeURIComponent(targetUrl);
    const shareText = encodeURIComponent(`Check out this amazing ${catalog.title}`);

    const socialLinks = [
        {
            name: "Facebook",
            icon: Facebook,
            url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
            color: "hover:bg-blue-50 hover:text-blue-600 text-blue-500",
        },
        {
            name: "Twitter",
            icon: Twitter,
            url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
            color: "hover:bg-sky-50 hover:text-sky-600 text-sky-500",
        },
        {
            name: "WhatsApp",
            icon: MessageCircle,
            url: `https://wa.me/?text=${shareText}%20${shareUrl}`,
            color: "hover:bg-green-50 hover:text-green-600 text-green-500",
        },
    ];

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(targetUrl);
            toast.success("Link copied to clipboard!");
        } catch (err) {
            toast.error("Failed to copy link");
        }
    };

    const handleShare = (url: string) => {
        window.open(url, "_blank", "width=600,height=400");
    };

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
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    className={cn("h-10 w-10 rounded-full bg-accent backdrop-blur-sm hover:bg-content3 hover:scale-110 active:scale-95", className)}
                    size="icon"
                    variant="ghost"
                >
                    <Share className="h-5 w-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 relative">
                <div className="p-4">
                    <h4 className="font-semibold mb-3 text-center">Share this collection</h4>

                    <div className="flex gap-2 mb-3 mt-4">
                        {socialLinks.map((social, idx: number) => (
                            <Button key={idx} className={cn("", social.color)} size="iconOnly" onClick={() => handleShare(social.url)}>
                                <social.icon className="h-8 w-8" />
                            </Button>
                        ))}
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Button className="w-full" variant="warning" onClick={copyToClipboard}>
                            <Link className="h-5 w-5 mr-1" />
                            <span className="text-xs">Copy Link</span>
                        </Button>

                        <Button className="w-full" variant="emerald" onClick={handleNativeShare}>
                            <Share className="h-5 w-5 mr-1" />
                            <span className="text-xs">More</span>
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
