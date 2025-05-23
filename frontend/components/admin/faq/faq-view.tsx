"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import { Button } from "@/components/ui/button";
import { FaqForm } from "@/components/admin/faq/faq-form";
import { FaqList } from "@/components/admin/faq/faq-list";
import { useFaqs } from "@/lib/hooks/useApi";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { FAQ } from "@/types/models";

const FaqView: React.FC = () => {
    const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);

    const { data, isLoading } = useFaqs();
    const state = useOverlayTriggerState({});

    const handleEdit = (faq: FAQ) => {
        setSelectedFaq(faq);
        state.open();
    };

    return (
        <div className="container mx-auto py-8 px-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage FAQs</h1>
                <Drawer open={state.isOpen} onOpenChange={state.setOpen}>
                    <DrawerTrigger asChild>
                        <Button variant="outline" onClick={state.open}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add New FAQ
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent className="px-4">
                        <DrawerHeader>
                            <DrawerTitle>Create FAQ</DrawerTitle>
                        </DrawerHeader>
                        <div className="max-w-2xl">
                            <FaqForm
                                faq={selectedFaq}
                                onCancel={() => {
                                    state.close();
                                    setSelectedFaq(null);
                                }}
                            />
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>
            <FaqList faqs={data || []} isLoading={isLoading} onEdit={handleEdit} />
        </div>
    );
};

export default FaqView;
