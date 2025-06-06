"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { toast } from "sonner";

import { FaqForm } from "./faq-form";

import { Button } from "@/components/ui/button";
import { FAQ } from "@/types/models";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Confirm } from "@/components/generic/confirm";
import { useInvalidate } from "@/lib/hooks/useApi";
import { api } from "@/apis/base";
import Overlay from "@/components/overlay";

interface FaqActionsProps {
    faq: FAQ;
}

const FaqActions = ({ faq }: FaqActionsProps) => {
    const invalidate = useInvalidate();
    const [faqToDelete, setFaqToDelete] = useState<number | null>(null);
    const state = useOverlayTriggerState({});
    const editState = useOverlayTriggerState({});

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

    return (
        <div className="flex items-center gap-1 shrink-0">
            <Overlay
                open={editState.isOpen}
                title="Edit FAQ"
                trigger={
                    <Button size="icon" variant="ghost">
                        <Pencil className="h-5 w-5" />
                    </Button>
                }
                onOpenChange={editState.setOpen}
            >
                <FaqForm
                    faq={faq}
                    onCancel={() => {
                        editState.close();
                    }}
                />
            </Overlay>
            <Dialog open={state.isOpen} onOpenChange={state.setOpen}>
                <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => setFaqToDelete(faq.id)}>
                        <Trash2 className="h-5 w-5 text-red-500" />
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
    );
};

export default FaqActions;
