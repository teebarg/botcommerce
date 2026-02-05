import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import { FaqForm } from "./faq-form";
import { Button } from "@/components/ui/button";
import type { FAQ } from "@/schemas";
import { useInvalidate } from "@/hooks/useApi";
import { useDeleteFaq } from "@/hooks/useFaq";
import SheetDrawer from "@/components/sheet-drawer";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";

interface FaqActionsProps {
    faq: FAQ;
}

const FaqActions = ({ faq }: FaqActionsProps) => {
    const invalidate = useInvalidate();
    const [faqToDelete, setFaqToDelete] = useState<number | null>(null);
    const deleteState = useOverlayTriggerState({});
    const editState = useOverlayTriggerState({});

    const { mutateAsync, isPending } = useDeleteFaq();

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
            <SheetDrawer
                open={editState.isOpen}
                title="Edit FAQ"
                trigger={
                    <Button className="bg-blue-50/80 text-blue-800" size="icon" variant="ghost">
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
            </SheetDrawer>
            <ConfirmDrawer
                open={deleteState.isOpen}
                onOpenChange={deleteState.setOpen}
                trigger={
                    <Button className="bg-red-50 text-red-800 hover:bg-red-100" size="icon" variant="ghost" onClick={() => setFaqToDelete(faq.id)}>
                        <Trash2 className="h-5 w-5" />
                    </Button>
                }
                onClose={deleteState.close}
                onConfirm={handleDelete}
                title="Delete FAQ"
                description="Are you sure you want to delete this FAQ? This action cannot be undone."
                confirmText="Delete"
                isLoading={isPending}
            />
        </div>
    );
};

export default FaqActions;
