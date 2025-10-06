"use client";

import { Plus } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import { Button } from "@/components/ui/button";
import { FaqForm } from "@/components/admin/faq/faq-form";
import { FaqList } from "@/components/admin/faq/faq-list";
import Overlay from "@/components/overlay";
import { useFaqs } from "@/lib/hooks/useFaq";

const FaqView: React.FC = () => {
    const { data, isLoading } = useFaqs();
    const state = useOverlayTriggerState({});

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
                            <Plus className="w-4 h-4 mr-2" />
                            Add New FAQ
                        </Button>
                    }
                    onOpenChange={state.setOpen}
                >
                    <FaqForm onCancel={() => state.close()} />
                </Overlay>
            </div>
            <FaqList faqs={data || []} isLoading={isLoading} />
        </div>
    );
};

export default FaqView;
