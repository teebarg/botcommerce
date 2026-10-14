import { api } from "@/utils/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ExternalLink, Images, Loader2, RefreshCw, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";
import { useOverlayTriggerState } from "react-stately";
import { toast } from "sonner";

export type Campaign = {
    code: string;
    title: string;
    product_count: number;
    url: string;
};

export const Route = createFileRoute("/_auth/_adminLayout/admin/albums")({
    component: CampaignsAdminPage,
});

const QUERY_KEY = ["products", "albums"] as const;

function CampaignsAdminPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const state = useOverlayTriggerState({});
    const [search, setSearch] = useState("");
    const [target, setTarget] = useState<Campaign | null>(null);

    const { data, isLoading, isFetching, error, refetch } = useQuery({
        queryKey: QUERY_KEY,
        queryFn: () => api.get<Campaign[]>("/product/admin/campaigns"),
    });

    const remove = useMutation({
        mutationFn: (code: string) => api.delete(`/product/admin/campaigns/${code}`),
        onSuccess: (_, code) => {
            queryClient.setQueryData<Campaign[]>(QUERY_KEY, (old) => old?.filter((c) => c.code !== code));
            setTarget(null);
            state.close();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete item, contact admin");
        },
    });

    const campaigns = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return data ?? [];
        return (data ?? [])?.filter((c) => c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
    }, [data, search]);

    return (
        <div className="mx-auto max-w-5xl w-full space-y-6 p-6">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="font-medium tracking-tight">Albums</p>
                    <p className="text-sm text-muted-foreground">{data ? `${campaigns.length} total` : "Manage product albums"}</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or code" className="w-64 pl-9" />
                    </div>
                    <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
                        <RefreshCw className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                    </Button>
                </div>
            </header>

            {error && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error.message}
                </div>
            )}

            {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            ) : campaigns?.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                    {search ? "No campaigns match your search." : "No campaigns yet."}
                </div>
            ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                    {campaigns.map((c) => (
                        <li key={c.code} className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-4">
                            <div className="min-w-0 space-y-1">
                                <h2 className="truncate font-medium">{c.title}</h2>
                                <p className="font-mono text-xs text-muted-foreground">{c.code}</p>
                                <p className="flex items-center gap-1.5 pt-1 text-sm text-muted-foreground">
                                    <Images className="h-4 w-4" />
                                    {c.product_count} product{c.product_count === 1 ? "" : "s"}
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <Button variant="outline" size="sm" onClick={() => navigate({ to: "/album/$slug", params: { slug: c.code } })}>
                                    <ExternalLink className="h-4 w-4" />
                                    Open
                                </Button>
                                <ConfirmDrawer
                                    open={state.isOpen}
                                    onOpenChange={state.setOpen}
                                    trigger={
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => {
                                                remove.reset();
                                                setTarget(c);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </Button>
                                    }
                                    onConfirm={() => {
                                        if (target) remove.mutate(target.code);
                                    }}
                                    onClose={state.close}
                                    title="Delete this campaign?"
                                    description={`“${target?.title}” with ${target?.product_count} product${target?.product_count === 1 ? "" : "s"} will be
                            removed and its link will stop working.`}
                                    isLoading={remove.isPending}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
