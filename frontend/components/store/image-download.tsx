import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageDownloadButtonProps {
    url: string;
    fallbackName?: string;
    className?: string;
}

export function ImageDownloadButton({ url, fallbackName = "file", className }: ImageDownloadButtonProps) {
    const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const resp = await fetch(url);

            if (!resp.ok) throw new Error("Failed to fetch image");

            const blob = await resp.blob();
            const href = URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = href;

            const contentType = resp.headers.get("Content-Type") || "";
            let ext = "jpg";

            if (contentType.includes("png")) ext = "png";
            else if (contentType.includes("jpeg")) ext = "jpeg";
            else if (contentType.includes("webp")) ext = "webp";

            const fileName = `${fallbackName}.${ext}`;

            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(href);
        } catch (err) {
            console.error("Download failed:", err);
        }
    };

    return (
        <Button className={cn("", className)} size="icon" variant="luxury" onClick={handleDownload}>
            <Download className="h-6 w-6" />
        </Button>
    );
}
