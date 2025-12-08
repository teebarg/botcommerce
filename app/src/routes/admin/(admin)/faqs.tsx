import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import { Button } from "@/components/ui/button";
import { FaqForm } from "@/components/admin/faq/faq-form";
import Overlay from "@/components/overlay";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getFaqsFn } from "@/server/faq.server";
import { Eye, EyeOff, Tag } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { FAQ } from "@/schemas";
import { Badge } from "@/components/ui/badge";
import FaqActions from "@/components/admin/faq/faq-actions";

const useFaqsQuery = () =>
    queryOptions({
        queryKey: ["faqs"],
        queryFn: () => getFaqsFn(),
    });

export const Route = createFileRoute("/admin/(admin)/faqs")({
    loader: async ({ context }) => {
        await context.queryClient.ensureQueryData(useFaqsQuery());
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { data: faqs } = useSuspenseQuery(useFaqsQuery());
    const state = useOverlayTriggerState({});

    if (faqs.length === 0) {
        return (
            <Card className="bg-card">
                <CardContent className="py-8">
                    <p className="text-center text-muted-foreground">No FAQs found</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="px-2 md:px-10 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage FAQs</h1>
                <Overlay
                    open={state.isOpen}
                    sheetClassName="min-w-[450px]"
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
                </Overlay>
            </div>
            <div className="space-y-4">
                {faqs.map((faq: FAQ, idx: number) => (
                    <Card key={idx} className="group hover:border-input bg-card">
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold leading-tight mb-2">{faq.question}</h3>
                                    <div className="flex items-center gap-3">
                                        {faq.category && (
                                            <Badge variant="blue">
                                                <Tag className="w-3 h-3 mr-1" />
                                                {faq.category}
                                            </Badge>
                                        )}
                                        <Badge variant={faq.is_active ? "emerald" : "destructive"}>
                                            {faq.is_active ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                                            {faq.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>

                                <FaqActions faq={faq} />
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-muted-foreground leading-relaxed m-0">{faq.answer}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
