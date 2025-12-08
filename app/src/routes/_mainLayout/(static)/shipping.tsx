import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle, Clock, Info } from "lucide-react";
import { currency } from "@/utils";

export const Route = createFileRoute("/_mainLayout/(static)/shipping")({
    head: () => ({
        meta: [
            {
                name: "description",
                content: "Shipping Information",
            },
            {
                title: "Shipping Information",
            },
        ],
    }),
    component: RouteComponent,
});

function RouteComponent() {
    const faqs = [
        {
            q: "When will my order ship?",
            a: "Orders placed before 2PM ship the same business day. Orders placed after 2PM or on weekends ship the next business day.",
        },
        {
            q: "Do you offer free shipping?",
            a: "No! We do not offer free shipping. You can select pickup and pick your order at the store.",
        },
        {
            q: "Can I change my shipping address?",
            a: "You can change your shipping address within 1 hour of placing your order. After that, please contact customer service.",
        },
        {
            q: "What if my package is lost or damaged?",
            a: "We'll replace lost or damaged packages at no cost to you. Just contact our support team with your order number.",
        },
    ];

    return (
        <div>
            <div className="bg-card border-b border-input">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold">Shipping Information</h1>
                    <p className="text-muted-foreground mt-2">Everything you need to know about shipping and delivery</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12">
                <div className="space-y-8">
                    {/* <TrackOrderForm /> */}

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-card rounded-xl shadow-sm p-8">
                            <h3 className="text-xl font-semibold mb-4">Shipping Options</h3>
                            <div className="space-y-4">
                                {[
                                    { name: "Standard Shipping", time: "3-5 business days", cost: currency(2500) },
                                    { name: "Express Shipping", time: "1-2 business days", cost: currency(5000) },
                                    { name: "Pickup", time: "Available on business days", cost: "Free" },
                                ].map((option) => (
                                    <div key={option.name} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                                        <div>
                                            <h4 className="font-medium">{option.name}</h4>
                                            <p className="text-sm text-muted-foreground">{option.time}</p>
                                        </div>
                                        <span className="font-semibold">{option.cost}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-card rounded-xl shadow-sm p-8">
                            <h3 className="text-xl font-semibold mb-4">International Shipping</h3>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 mr-3" />
                                    <div>
                                        <p className="font-medium">We ship worldwide</p>
                                        <p className="text-sm text-muted-foreground">Available to most countries</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Clock className="h-5 w-5 text-blue-600 mt-1 mr-3" />
                                    <div>
                                        <p className="font-medium">7-14 business days</p>
                                        <p className="text-sm text-muted-foreground">Delivery time varies by location</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Info className="h-5 w-5 text-orange-600 mt-1 mr-3" />
                                    <div>
                                        <p className="font-medium">Customs & duties</p>
                                        <p className="text-sm text-muted-foreground">May apply based on destination</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl shadow-sm p-8">
                        <h2 className="text-xl font-semibold mb-6">Shipping FAQ</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <details key={index} className="group">
                                    <summary className="flex justify-between items-center cursor-pointer p-4 rounded-lg transition-colors">
                                        <span className="font-medium">{faq.q}</span>
                                        <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                                    </summary>
                                    <div className="p-4 text-muted-foreground border-t border-input bg-secondary">{faq.a}</div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
