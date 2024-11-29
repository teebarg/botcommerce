"use client";

import React, { useState } from "react";
import { ChevronDown, MailIcon } from "nui-react-icons";

const SupportPage = () => {
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
        <div className="min-h-screen bg-gray-50 p-6 md:p-12 flex flex-col">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Luxury Client Support</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    {`Personalized assistance for our discerning clients. We're here to ensure your exceptional experience.`}
                </p>
            </header>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-xl shadow-md text-center">
                    <MailIcon className="mx-auto mb-4 text-indigo-600" size={48} />
                    <h3 className="text-xl font-semibold mb-2">Email Support</h3>
                    <p className="text-gray-600 mb-4">clientcare@luxurystore.com</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md text-center">
                    {/* <PhoneCall className="mx-auto mb-4 text-emerald-600" size={48} /> */}
                    <h3 className="text-xl font-semibold mb-2">Phone Concierge</h3>
                    <p className="text-gray-600 mb-4">+1 (888) LUXURY-CARE</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md text-center">
                    {/* <Clock className="mx-auto mb-4 text-amber-600" size={48} /> */}
                    <h3 className="text-xl font-semibold mb-2">Support Hours</h3>
                    <p className="text-gray-600 mb-4">Mon-Sat: 9am - 7pm EST</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto w-full">
                <h2 className="text-3xl font-serif font-bold text-center mb-8">Frequently Asked Questions</h2>

                {faqSections.map((section, index) => (
                    <div key={index} className="mb-4">
                        <button
                            onClick={() => setActiveSection(activeSection === index ? null : index)}
                            className="w-full bg-white p-4 rounded-lg shadow-sm flex justify-between items-center hover:bg-gray-100 transition"
                        >
                            <span className="text-xl font-semibold">{section.title}</span>
                            <ChevronDown className={`transform transition-transform ${activeSection === index ? "rotate-180" : ""}`} />
                        </button>

                        {activeSection === index && (
                            <div className="bg-white p-6 rounded-b-lg shadow-md">
                                {section.questions.map((item, qIndex) => (
                                    <div key={qIndex} className="mb-4 last:mb-0">
                                        <h4 className="font-semibold text-lg mb-2">{item.q}</h4>
                                        <p className="text-gray-600">{item.a}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="bg-white mt-12 p-8 rounded-xl shadow-lg text-center">
                {/* <Headphones className="mx-auto mb-4 text-indigo-700" size={60} /> */}
                <h3 className="text-2xl font-semibold mb-4">Personal Concierge Support</h3>
                <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                    For personalized assistance beyond our standard support channels, our dedicated concierge team is available to provide white-glove
                    service tailored to your unique needs.
                </p>
                <button className="bg-indigo-600 text-white px-8 py-3 rounded-full hover:bg-indigo-700 transition font-semibold">
                    Request Concierge Assistance
                </button>
            </div>

            <footer className="mt-12 text-center text-gray-500">
                <div className="flex items-center justify-center mb-4">
                    {/* <Shield className="mr-2 text-green-600" size={24} /> */}
                    <span>Secure & Confidential Support</span>
                </div>
                <p>© 2024 Luxury Store. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default SupportPage;
