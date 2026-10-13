import { api } from "@/utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { type FormEvent, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, Copy, ExternalLink, Share2 } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";

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

export function AlbumCreation({ onClose, productIds }: AlbumCreationProps) {
    console.log("productIds", productIds);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [createFormOpen, setCreateFormOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [createdAlbum, setCreatedAlbum] = useState<AlbumRecord | null>(null);
    const [creating, setCreating] = useState(false);
    const [copied, setCopied] = useState(false);

    // const createAlbum = useMutation({
    //     mutationFn: async (cartId: number) => await api.post<{}>(`/abandoned-carts/${cartId}/send-reminder`),
    //     onSuccess: () => {
    //         toast.success("Recovery email sent");
    //     },
    //     onError: (error: any) => {
    //         toast.error(error.message || "Failed to send recovery email");
    //     },
    // });

    async function createAlbum(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const cleanTitle = title.trim();
        if (!cleanTitle || productIds.length === 0 || creating) return;
        setCreating(true);
        try {
            // const result = await mockCreateAlbum({ title: cleanTitle, product_ids: selectedIds });
            const result = await api.post<{ code: string; url: string }>(`/product/admin/campaigns`, { title: cleanTitle, product_ids: productIds });
            const record: AlbumRecord = { ...result, title: cleanTitle, product_ids: productIds };
            // window.localStorage.setItem(albumStorageKey(result.code), JSON.stringify(record));
            setCreatedAlbum(record);
            setCreateFormOpen(false);
            setCopied(false);
        } finally {
            setCreating(false);
        }
    }

    async function copyUrl() {
        if (!createdAlbum) return;
        try {
            await navigator.clipboard.writeText(createdAlbum.url);
            setCopied(true);
        } catch {
            setCopied(false);
        }
    }

    const encodedUrl = encodeURIComponent(createdAlbum?.url ?? "");
    const encodedShareText = encodeURIComponent(createdAlbum ? `Take a look at ${createdAlbum.title}` : "");

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
                        <div className="mt-7 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-y border-border py-4">
                            <p className="min-w-0 truncate text-sm" aria-label="Album link">
                                {createdAlbum.url}
                            </p>
                            <Button type="button" variant="outline" onClick={copyUrl} className="shrink-0">
                                {copied ? <Check /> : <Copy />}
                                {copied ? "Copied" : "Copy link"}
                            </Button>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2">
                            <Button onClick={() => navigate({ to: "/album/$slug", params: { slug: createdAlbum.code } })}>
                                <ExternalLink />
                                Open album
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={async () => {
                                    if (!createdAlbum || !navigator.share) return;
                                    try {
                                        await navigator.share({
                                            title: createdAlbum.title,
                                            text: `Take a look at ${createdAlbum.title}`,
                                            url: createdAlbum.url,
                                        });
                                    } catch {
                                        /* User may dismiss the share sheet. */
                                    }
                                }}
                            >
                                <Share2 />
                                Share
                            </Button>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                            <a
                                className="text-primary underline underline-offset-4"
                                href={`https://wa.me/?text=${encodeURIComponent(`${createdAlbum.title}: ${createdAlbum.url}`)}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                WhatsApp
                            </a>
                            <a
                                className="text-primary underline underline-offset-4"
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Facebook
                            </a>
                            <a
                                className="text-primary underline underline-offset-4"
                                href={`https://twitter.com/intent/tweet?text=${encodedShareText}&url=${encodedUrl}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                X
                            </a>
                            <Button
                                variant="link"
                                className="h-auto p-0 text-sm"
                                onClick={() => {
                                    setCreatedAlbum(null);
                                    setCreateFormOpen(false);
                                }}
                            >
                                Create another
                            </Button>
                        </div>
                    </section>
                ) : (
                    <>
                        <div className="mb-6 flex items-end justify-between gap-4">
                            <span className="shrink-0 pb-1 text-xs text-muted-foreground">{productIds.length} selected</span>
                        </div>

                        <div className="sticky bottom-0 mt-8 border-t border-border bg-background/95 py-4 backdrop-blur-md">
                            {!createFormOpen ? (
                                <Button
                                    type="button"
                                    className="h-11 w-full sm:w-auto"
                                    disabled={productIds.length === 0}
                                    onClick={() => {
                                        setTitle("");
                                        setCreateFormOpen(true);
                                    }}
                                >
                                    Create album · {productIds.length} {productIds.length === 1 ? "piece" : "pieces"}
                                </Button>
                            ) : (
                                <form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end" onSubmit={createAlbum}>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="album-title">Album title</Label>
                                        <Input
                                            id="album-title"
                                            autoFocus
                                            required
                                            maxLength={80}
                                            value={title}
                                            onChange={(event) => setTitle(event.target.value)}
                                            placeholder="e.g. Sunday in Lagos"
                                        />
                                    </div>
                                    <Button type="button" variant="outline" className="h-11" onClick={() => setCreateFormOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="h-11" disabled={!title.trim() || creating}>
                                        {creating ? "Creating…" : "Create and share"}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
