"use client";

import { useState } from "react";
import { Eye, EyeOff, Pencil, Tag, Trash2 } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FAQ } from "@/types/models";
import { TextSkeleton } from "@/components/ui/skeletons";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Confirm } from "@/components/generic/confirm";
import { useInvalidate } from "@/lib/hooks/useApi";
import { api } from "@/apis/base";

interface FaqListProps {
    faqs: FAQ[];
    isLoading: boolean;
    onEdit: (faq: FAQ) => void;
}

export function FaqList({ faqs, isLoading, onEdit }: FaqListProps) {
    const invalidate = useInvalidate();
    const [faqToDelete, setFaqToDelete] = useState<number | null>(null);
    const state = useOverlayTriggerState({});

    const handleDelete = async () => {
        if (!faqToDelete) return;
        try {
            const { error } = await api.delete<any>(`/faq/${faqToDelete}`);

            if (error) throw error;

            invalidate("faqs");
            toast.success("FAQ deleted successfully");
            setFaqToDelete(null);
            state.close();
        } catch (error) {
            toast.error("Failed to delete FAQ");
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader>
                            <TextSkeleton className="h-4 w-3/4" lines={1} />
                        </CardHeader>
                        <CardContent>
                            <TextSkeleton className="h-4" lines={2} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (faqs.length === 0) {
        return (
            <Card>
                <CardContent className="py-8">
                    <p className="text-center text-gray-500">No FAQs found</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {faqs.map((faq: FAQ, idx: number) => (
                    <Card key={idx} className="group hover:border-input">
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-default-900 leading-tight mb-2">{faq.question}</h3>
                                    <div className="flex items-center gap-3">
                                        {faq.category && (
                                            <Badge variant="secondary">
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

                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <Button size="icon" variant="ghost" onClick={() => onEdit(faq)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Dialog open={state.isOpen} onOpenChange={state.setOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="icon" variant="destructive" onClick={() => setFaqToDelete(faq.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle className="sr-only">Delete</DialogTitle>
                                            </DialogHeader>
                                            <Confirm onClose={state.close} onConfirm={handleDelete} />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-default-700 leading-relaxed m-0">{faq.answer}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
