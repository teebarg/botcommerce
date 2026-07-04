import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Plus } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import { Button } from "@/components/ui/button";
import { FaqForm } from "@/components/admin/faq/faq-form";
import { useQuery } from "@tanstack/react-query";
import { Tag } from "lucide-react";
import type { FAQ } from "@/schemas";
import { Badge } from "@/components/ui/badge";
import FaqActions from "@/components/admin/faq/faq-actions";
import SheetDrawer from "@/components/sheet-drawer";
import { api } from "@/utils/api";
import EmptyState from "@/components/generic/empty";
import { PageLoader } from "@/components/generic/page-loader";

export const Route = createFileRoute("/_adminLayout/admin/(admin)/faqs")({
    component: RouteComponent,
});

function RouteComponent() {
    const { data: faqs = [], isPending } = useQuery({
        queryKey: ["faqs"],
        queryFn: () => api.get<FAQ[]>("/faq/"),
        staleTime: Infinity,
    });
    const state = useOverlayTriggerState({});

    return (
        <div className="px-2 py-2 max-w-5xl">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-lg font-semibold">Manage FAQs</h1>
                <SheetDrawer
                    open={state.isOpen}
                    title="Add New FAQ"
                    trigger={
                        <Button onClick={state.open}>
                            <Plus className="w-4 h-4" />
                            Add New FAQ
                        </Button>
                    }
                    onOpenChange={state.setOpen}
                >
                    <FaqForm onCancel={() => state.close()} />
                </SheetDrawer>
            </div>
            <div className="space-y-4">
                {isPending ? (
                    <PageLoader variant="list" />
                ) : faqs?.length == 0 ? (
                    <EmptyState
                        title="No FAQs found"
                        description="You havent created FAQs for your shop"
                        icon={MessageCircle}
                        action={
                            <Button onClick={state.open}>
                                <Plus className="w-4 h-4" />
                                Add New FAQ
                            </Button>
                        }
                    />
                ) : faqs.map((faq: FAQ, idx: number) => (
                    <div key={idx} className="bg-card rounded-2xl border border-border">
                        <div className="flex items-start justify-between gap-4 p-4">
                            <div className="min-w-0 space-y-1.5">
                                <p className="text-xs font-medium text-muted-foreground truncate">
                                    {faq.question}
                                </p>
                                <h3 className="text-sm font-medium">{faq.answer}</h3>
                            </div>
                            <Badge variant={faq.is_active ? "success" : "destructive"}>
                                {faq.is_active ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        <div className="border-t border-border px-5 py-2 bg-muted/50 flex items-center justify-between">
                            <Badge variant="accent">
                                <Tag className="w-3 h-3 mr-1" />
                                {faq.category}
                            </Badge>
                            <FaqActions faq={faq} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
