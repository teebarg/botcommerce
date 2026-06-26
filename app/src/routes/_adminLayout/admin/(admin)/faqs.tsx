import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Plus } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import { Button } from "@/components/ui/button";
import { FaqForm } from "@/components/admin/faq/faq-form";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { Eye, EyeOff, Tag } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { FAQ } from "@/schemas";
import { Badge } from "@/components/ui/badge";
import FaqActions from "@/components/admin/faq/faq-actions";
import SheetDrawer from "@/components/sheet-drawer";
import { api } from "@/utils/api";
import EmptyState from "@/components/generic/empty";
import { PageLoader } from "@/components/generic/page-loader";

const faqsQuery = () =>
    queryOptions({
        queryKey: ["faqs"],
        queryFn: () => api.get<FAQ[]>("/faq/"),
        staleTime: Infinity,
    });

export const Route = createFileRoute("/_adminLayout/admin/(admin)/faqs")({
    loader: async ({ context }) => {
        context.queryClient.prefetchQuery(faqsQuery());
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { data: faqs = [], isPending } = useQuery(faqsQuery());
    const state = useOverlayTriggerState({});

    return (
        <div className="px-2 max-w-5xl mx-auto py-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Manage FAQs</h1>
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
                    <Card key={idx} className="group hover:border-input bg-card">
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold leading-tight mb-2">{faq.question}</h3>
                                    <div className="flex items-center gap-3">
                                        {faq.category && (
                                            <Badge variant="accent">
                                                <Tag className="w-3 h-3 mr-1" />
                                                {faq.category}
                                            </Badge>
                                        )}
                                        <Badge variant={faq.is_active ? "success" : "destructive"}>
                                            {faq.is_active ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                                            {faq.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                                <FaqActions faq={faq} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="max-w-none">
                                <p className="text-muted-foreground leading-relaxed m-0 text-sm">{faq.answer}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
