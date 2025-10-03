"use client";

import { Eye, EyeOff, Tag } from "lucide-react";

import FaqActions from "./faq-actions";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FAQ } from "@/schemas";
import { Badge } from "@/components/ui/badge";
import ComponentLoader from "@/components/component-loader";

interface FaqListProps {
    faqs: FAQ[];
    isLoading: boolean;
}

export function FaqList({ faqs, isLoading }: FaqListProps) {
    if (isLoading) {
        return <ComponentLoader className="h-[calc(100vh-200px)]" />;
    }

    if (faqs.length === 0) {
        return (
            <Card className="bg-secondary">
                <CardContent className="py-8">
                    <p className="text-center text-muted-foreground">No FAQs found</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {faqs.map((faq: FAQ, idx: number) => (
                <Card key={idx} className="group hover:border-divider bg-secondary">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold leading-tight mb-2">{faq.question}</h3>
                                <div className="flex items-center gap-3">
                                    {faq.category && (
                                        <Badge variant="yellow">
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
    );
}
