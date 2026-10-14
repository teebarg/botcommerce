import { api } from "@/utils/api";
import { Button } from "../ui/button";
import { type FormEvent, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, Copy, ExternalLink, Mail, MessageCircle, Send, Share2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export type AlbumRecord = {
    code: string;
    url: string;
    title: string;
    product_ids: number[];
};

interface AlbumCreationProps {
    productIds: number[];
    onClose: () => void;
}

const defaultMessage = (title: string, count: number) =>
    `Hi 👋 I put together *${title}*, ${count} piece${count === 1 ? "" : "s"} I think you'll love.\n\nTap to browse and pick your favourites:`;

export function AlbumCreation({ onClose, productIds }: AlbumCreationProps) {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [createdAlbum, setCreatedAlbum] = useState<AlbumRecord | null>(null);
    const [message, setMessage] = useState("");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [canNativeShare, setCanNativeShare] = useState(false);

    useEffect(() => {
        setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
    }, []);

    async function createAlbum(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const cleanTitle = title.trim();
        if (!cleanTitle || productIds.length === 0 || creating) return;
        setCreating(true);
        setError("");
        try {
            const result = await api.post<{ code: string; url: string }>(`/product/admin/campaigns`, { title: cleanTitle, product_ids: productIds });
            const record: AlbumRecord = { ...result, title: cleanTitle, product_ids: productIds };
            setCreatedAlbum(record);
            setMessage(defaultMessage(cleanTitle, productIds.length));
            setCopied(false);
        } catch {
            setError("Couldn't create the album. Please try again.");
        } finally {
            setCreating(false);
        }
    }

    function link(src: string): string {
        if (!createdAlbum) return "";
        try {
            const u = new URL(createdAlbum.url);
            u.searchParams.set("src", src);
            return u.toString();
        } catch {
            return createdAlbum.url;
        }
    }

    const fullText = (src: string) => `${message.trim()}\n${link(src)}`;
    const enc = encodeURIComponent;

    async function copyMessage() {
        try {
            await navigator.clipboard.writeText(fullText("copy"));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    }

    async function nativeShare() {
        if (!createdAlbum) return;
        try {
            // Link lives inside `text` only. Passing `url` as well makes some apps drop or duplicate it.
            await navigator.share({ title: createdAlbum.title, text: fullText("share") });
        } catch {}
    }

    const channels = createdAlbum
        ? [
              { label: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${enc(fullText("wa"))}` },
              { label: "Telegram", icon: Send, href: `https://t.me/share/url?url=${enc(link("tg"))}&text=${enc(message.trim())}` },
              { label: "Facebook", icon: Share2, href: `https://www.facebook.com/sharer/sharer.php?u=${enc(link("fb"))}` },
              { label: "Email", icon: Mail, href: `mailto:?subject=${enc(createdAlbum.title)}&body=${enc(fullText("email"))}` },
          ]
        : [];

    return (
        <main className="">
            <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
                {createdAlbum ? (
                    <section aria-labelledby="album-created-title" className="max-w-2xl">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Album created</p>
                        <h2 id="album-created-title" className="mt-2 font-editorial text-4xl">
                            {createdAlbum.title}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">{createdAlbum.product_ids.length} pieces · Ready to share</p>

                        <div className="mt-7 space-y-2">
                            <Label htmlFor="share-message">Message (edit before sharing)</Label>
                            <textarea
                                id="share-message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                            <p className="truncate text-xs text-muted-foreground" aria-label="Album link">
                                {createdAlbum.url}
                            </p>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                            {canNativeShare && (
                                <Button type="button" onClick={nativeShare}>
                                    <Share2 />
                                    Share
                                </Button>
                            )}
                            <Button type="button" variant="outline" onClick={copyMessage}>
                                {copied ? <Check /> : <Copy />}
                                {copied ? "Copied" : "Copy message"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate({ to: "/album/$slug", params: { slug: createdAlbum.code } })}
                            >
                                <ExternalLink />
                                Open album
                            </Button>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-1.5">
                            {channels.map(({ label, icon: Icon, href }) => (
                                <Button key={label} variant="outline" asChild>
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex gap-1 items-center bg-accent/50 rounded-md p-2 text-sm"
                                    >
                                        <Icon className="w-5 h-5" />
                                        {label}
                                    </a>
                                </Button>
                            ))}
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                            WhatsApp opens your contact list, so you can pick one person or several groups. For Instagram, TikTok or Status, tap “Copy
                            message”.
                        </p>
                    </section>
                ) : (
                    <>
                        <div className="flex items-end justify-between gap-4">
                            <span className="shrink-0 pb-1 text-xs text-muted-foreground">{productIds.length} selected</span>
                        </div>

                        <div className="sticky bottom-0 mt-2 border-t border-border bg-background/95 py-4 backdrop-blur-md">
                            <form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end" onSubmit={createAlbum}>
                                <div className="space-y-2">
                                    <Label htmlFor="album-title">Album title</Label>
                                    <Input
                                        id="album-title"
                                        autoFocus
                                        required
                                        maxLength={80}
                                        value={title}
                                        onChange={(event) => setTitle(event.target.value)}
                                        placeholder="e.g. Office pant trousers"
                                    />
                                    {error && <p className="text-sm text-destructive">{error}</p>}
                                </div>
                                <Button type="button" size="lg" variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" size="lg" disabled={!title.trim() || creating}>
                                    {creating ? "Creating…" : "Create and share"}
                                </Button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
