"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const FAQSection: React.FC = () => {
    const [activeSection, setActiveSection] = useState<number | null>(null);

    const faqSections = [
        {
            title: "Order & Shipping",
            questions: [
                {
                    q: "How long does shipping take for luxury items?",
                    a: "Our premium items are carefully packaged and shipped within 2-3 business days. International shipments may take 5-10 business days. Each order includes complimentary luxury tracking and insurance.",
                },
                {
                    q: "What are the shipping costs?",
                    a: "We offer complimentary shipping on all orders over $500. For orders under $500, a flat rate of $25 applies. Each shipment includes signature-required delivery and white-glove handling.",
                },
            ],
        },
        {
            title: "Returns & Exchanges",
            questions: [
                {
                    q: "What is your return policy?",
                    a: "We offer a 30-day return window for unworn, pristine items with original packaging. Luxury pieces can be returned for store credit or exchange. Each return is processed with white-glove care.",
                },
                {
                    q: "How do I initiate a return?",
                    a: "Contact our concierge team via email or phone. We'll provide a prepaid luxury courier envelope and guide you through our seamless return process.",
                },
            ],
        },
    ];

    return (
        <div className="max-w-4xl mx-auto w-full">
            <h2 className="text-3xl font-serif font-bold text-center mb-8">Frequently Asked Questions</h2>

            {faqSections.map((section, index: number) => (
                <div key={index} className="mb-4">
                    <button
                        aria-label="open faq"
                        className="w-full bg-default p-4 rounded-lg shadow-sm flex justify-between items-center hover:bg-default-100 transition"
                        onClick={() => setActiveSection(activeSection === index ? null : index)}
                    >
                        <span className="text-xl font-semibold">{section.title}</span>
                        <ChevronDown className={cn("transform transition-transform", { "rotate-180": activeSection === index })} />
                    </button>

                    {activeSection === index && (
                        <div className="bg-default p-6 rounded-b-lg shadow-md">
                            {section.questions.map((item, qIndex: number) => (
                                <div key={qIndex} className="mb-4 last:mb-0">
                                    <h4 className="font-semibold text-lg mb-2">{item.q}</h4>
                                    <p className="text-default-500">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default FAQSection;
