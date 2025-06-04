"use client";

import { Eye, EyeOff, Tag } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FAQ } from "@/types/models";
import { TextSkeleton } from "@/components/ui/skeletons";
import { Badge } from "@/components/ui/badge";
import FaqActions from "./faq-actions";

interface FaqListProps {
    faqs: FAQ[];
    isLoading: boolean;
}

export function FaqList({ faqs, isLoading }: FaqListProps) {
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
                    <p className="text-center text-default-500">No FAQs found</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {faqs.map((faq: FAQ, idx: number) => (
                <Card key={idx} className="group hover:border-input bg-content1">
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

                            <FaqActions faq={faq} />
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
    );
}
