"use client";

import { Plus } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import { Button } from "@/components/ui/button";
import { FaqForm } from "@/components/admin/faq/faq-form";
import { FaqList } from "@/components/admin/faq/faq-list";
import { useFaqs } from "@/lib/hooks/useApi";
import Overlay from "@/components/overlay";

const FaqView: React.FC = () => {
    const { data, isLoading } = useFaqs();
    const state = useOverlayTriggerState({});

    return (
        <div className="px-2 md:px-10 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage FAQs</h1>
                <Overlay
                    trigger={
                        <Button variant="primary" onClick={state.open}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add New FAQ
                        </Button>
                    }
                    open={state.isOpen}
                    onOpenChange={state.setOpen}
                    title="Add New FAQ"
                    sheetClassName="min-w-[450px]"
                >
                    <FaqForm onCancel={() => state.close()} />
                </Overlay>
            </div>
            <FaqList faqs={data || []} isLoading={isLoading} />
        </div>
    );
};

export default FaqView;
