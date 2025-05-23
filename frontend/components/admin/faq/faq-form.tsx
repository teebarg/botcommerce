"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { api } from "@/apis/base";
import { FAQ } from "@/types/models";
import { useInvalidate } from "@/lib/hooks/useApi";
import { Checkbox } from "@/components/ui/checkbox";

interface FaqFormProps {
    faq?: FAQ | null;
    onCancel: () => void;
}

export function FaqForm({ faq, onCancel }: FaqFormProps) {
    const invalidate = useInvalidate();
    const [formData, setFormData] = useState({
        question: "",
        answer: "",
        is_active: false,
        category: "",
    });
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (faq) {
            setFormData({
                question: faq.question,
                answer: faq.answer,
                is_active: faq.is_active,
                category: faq.category || "",
            });
        }
    }, [faq]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (faq) {
                const { error } = await api.patch<FAQ>(`/faq/${faq.id}`, formData);

                if (error) throw error;
                toast.success("FAQ updated successfully");
            } else {
                const { error } = await api.post<FAQ>(`/faq`, formData);

                if (error) throw error;
                toast.success("FAQ created successfully");
            }

            onCancel();
            setFormData({
                question: "",
                answer: "",
                is_active: false,
                category: "",
            });
            invalidate("faqs");
        } catch (error) {
            toast.error("Failed to save FAQ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{faq ? "Edit FAQ" : "Create New FAQ"}</h2>
                <Button className="h-8 w-8" size="icon" variant="ghost" onClick={onCancel}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="question">
                        Question
                    </label>
                    <Input
                        required
                        id="question"
                        placeholder="Enter the question"
                        value={formData.question}
                        onChange={(e) => setFormData((prev) => ({ ...prev, question: e.target.value }))}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="answer">
                        Answer
                    </label>
                    <Textarea
                        required
                        id="answer"
                        placeholder="Enter the answer"
                        rows={4}
                        value={formData.answer}
                        onChange={(e) => setFormData((prev) => ({ ...prev, answer: e.target.value }))}
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="category">
                        Category
                    </label>
                    <Input
                        id="category"
                        placeholder="Enter the category"
                        value={formData.category}
                        onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    />
                </div>

                {/* Status */}
                <div className="text-default-500 flex items-center">
                    <Checkbox
                        checked={formData.is_active}
                        name="agreement"
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked == "indeterminate" ? false : checked }))}
                    />
                    <label className="ml-2 text-sm">Active</label>
                </div>
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button disabled={loading} isLoading={loading} type="submit">
                        {faq ? "Update FAQ" : "Create FAQ"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
