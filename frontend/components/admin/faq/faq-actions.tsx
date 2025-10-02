"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import { FaqForm } from "./faq-form";

import { Button } from "@/components/ui/button";
import { FAQ } from "@/schemas";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Confirm } from "@/components/generic/confirm";
import { useInvalidate } from "@/lib/hooks/useApi";
import Overlay from "@/components/overlay";
import { useDeleteFaq } from "@/lib/hooks/useFaq";

interface FaqActionsProps {
    faq: FAQ;
}

const FaqActions = ({ faq }: FaqActionsProps) => {
    const invalidate = useInvalidate();
    const [faqToDelete, setFaqToDelete] = useState<number | null>(null);
    const deleteState = useOverlayTriggerState({});
    const editState = useOverlayTriggerState({});

    const { mutateAsync } = useDeleteFaq();

    const handleDelete = async () => {
        if (!faqToDelete) return;
        mutateAsync(faqToDelete).then(() => {
            invalidate("faqs");
            setFaqToDelete(null);
            deleteState.close();
        });
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
            <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => setFaqToDelete(faq.id)}>
                        <Trash2 className="h-5 w-5 text-red-500" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader className="sr-only">
                        <DialogTitle>Delete</DialogTitle>
                    </DialogHeader>
                    <Confirm onClose={deleteState.close} onConfirm={handleDelete} />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FaqActions;
