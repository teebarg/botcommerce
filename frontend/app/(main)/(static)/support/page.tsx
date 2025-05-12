import React from "react";
import { Clock, Headphones, Mail, PhoneCall } from "nui-react-icons";
import { Metadata } from "next";

import FAQSection from "./faq-section";

import { getSiteConfig } from "@/lib/config";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export const metadata: Metadata = {
    title: "Support",
};

const SupportPage = async () => {
    const siteConfig = await getSiteConfig();
    const details = [
        {
            label: "Email Support",
            text: siteConfig.contactEmail,
            icon: <Mail className="mx-auto mb-2 text-primary h-12 w-12" />,
        },
        {
            label: "Phone",
            text: siteConfig.contactPhone,
            icon: <PhoneCall className="mx-auto mb-2 text-success h-12 w-12" />,
        },
        {
            label: "Support Hours",
            text: "Mon-Sat: 9am - 7pm GMT",
            icon: <Clock className="mx-auto mb-2 text-primary h-12 w-12" />,
        },
    ];

    return (
        <div className="min-h-screen bg-content1 p-6 md:p-12 flex flex-col">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-serif font-bold text-default-900 mb-4">Client Support</h1>
                <p className="text-xl text-default-500 max-w-2xl mx-auto">
                    {`Personalized assistance for our discerning clients. We're here to ensure your exceptional experience.`}
                </p>
            </header>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
                {details.map((i, index: number) => (
                    <div key={index} className="bg-default p-6 rounded-xl shadow-md text-center">
                        {i.icon}
                        <h3 className="text-xl font-semibold mb-1">{i.label}</h3>
                        <p className="text-default-500 mb-4">{i.text}</p>
                    </div>
                ))}
            </div>

            <FAQSection />

            <div className="bg-default mt-12 py-16 rounded-xl shadow-lg text-center">
                <Headphones className="mx-auto mb-2 text-warning h-12 w-12" />
                <h3 className="text-2xl font-semibold mb-2">Personal Support</h3>
                <p className="text-default-500 max-w-2xl mx-auto mb-6">
                    For personalized assistance beyond our standard support channels, our dedicated concierge team is available to provide white-glove
                    service tailored to your unique needs.
                </p>
                <Button aria-label="support" color="secondary">
                    Request Personal Assistance
                </Button>
            </div>
        </div>
    );
};

export default SupportPage;
