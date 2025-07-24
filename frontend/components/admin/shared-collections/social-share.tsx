import { Facebook, Twitter, MessageCircle, Link, Share } from "lucide-react";
// import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Shared } from "@/schemas";
import { cn } from "@/lib/utils";

interface SocialShareProps {
    collection: Shared;
    className?: string;
}

export function SocialShare({ collection, className }: SocialShareProps) {
    const shareUrl = encodeURIComponent(window.location.href);
    const shareText = encodeURIComponent(`Check out this amazing ${collection.title}`);
    const shareTitle = encodeURIComponent(collection.title);

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
            await navigator.clipboard.writeText(window.location.href);
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
                    title: collection.title,
                    text: `Check out this amazing ${collection.title}`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log("Error sharing:", err);
            }
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                        "h-10 w-10 rounded-full text-default-800 hover:text-default-900 bg-content2 backdrop-blur-sm hover:bg-content3 hover:scale-110 active:scale-95",
                        className
                    )}
                >
                    <Share className="h-5 w-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 relative" align="end">
                <div className="p-4">
                    <h4 className="font-semibold mb-3 text-center">Share this collection</h4>

                    <div className="flex gap-2 mb-3 mt-4">
                        {socialLinks.map((social, idx: number) => (
                            <Button key={idx} className={`${social.color}`} onClick={() => handleShare(social.url)} size="iconOnly">
                                <social.icon className="h-8 w-8" />
                            </Button>
                        ))}
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Button variant="outline" onClick={copyToClipboard} className="w-full">
                            <Link className="h-5 w-5 mr-1" />
                            <span className="text-xs">Copy Link</span>
                        </Button>

                        <Button variant="outline" onClick={handleNativeShare} className="w-full">
                            <Share className="h-5 w-5 mr-1" />
                            <span className="text-xs">More</span>
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
