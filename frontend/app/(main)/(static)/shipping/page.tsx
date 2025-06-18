import { CheckCircle, Clock, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { currency } from "@/lib/utils";

const ShippingPage = () => (
    <div className="bg-content2">
        <div className="bg-content1 border-b border-divider">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-default-foreground">Shipping Information</h1>
                <p className="text-default-600 mt-2">Everything you need to know about shipping and delivery</p>
            </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="space-y-8">
                <div className="bg-content1 rounded-xl shadow-sm border border-divider p-8">
                    <h2 className="text-2xl font-bold text-default-foreground mb-6">Track Your Order</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-default-700 mb-2">Tracking Number</label>
                            <div className="flex gap-4">
                                <Input className="flex-1 w-full" placeholder="Enter tracking number" type="text" />
                                <Button variant="primary">Track Order</Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-content1 rounded-xl shadow-sm border border-divider p-8">
                        <h3 className="text-xl font-semibold text-default-foreground mb-4">Shipping Options</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-default-foreground">Standard Shipping</h4>
                                    <p className="text-sm text-default-600">3-5 business days</p>
                                </div>
                                <span className="font-semibold text-default-foreground">{currency(2500)}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-default-foreground">Express Shipping</h4>
                                    <p className="text-sm text-default-600">1-2 business days</p>
                                </div>
                                <span className="font-semibold text-default-foreground">{currency(5000)}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-default-foreground">Pickup</h4>
                                    <p className="text-sm text-default-600">Available on business days</p>
                                </div>
                                <span className="font-semibold text-default-foreground">Free</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-content1 rounded-xl shadow-sm border border-divider p-8">
                        <h3 className="text-xl font-semibold text-default-foreground mb-4">International Shipping</h3>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-600 mt-1 mr-3" />
                                <div>
                                    <p className="font-medium text-default-foreground">We ship worldwide</p>
                                    <p className="text-sm text-default-600">Available to most countries</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Clock className="h-5 w-5 text-blue-600 mt-1 mr-3" />
                                <div>
                                    <p className="font-medium text-default-foreground">7-14 business days</p>
                                    <p className="text-sm text-default-600">Delivery time varies by location</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Info className="h-5 w-5 text-orange-600 mt-1 mr-3" />
                                <div>
                                    <p className="font-medium text-default-foreground">Customs & duties</p>
                                    <p className="text-sm text-default-600">May apply based on destination</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-content1 rounded-xl shadow-sm border border-divider p-8">
                    <h2 className="text-xl font-semibold text-default-foreground mb-6">Shipping FAQ</h2>
                    <div className="space-y-4">
                        {[
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
                        ].map((faq, index: number) => (
                            <details key={index} className="group">
                                <summary className="flex justify-between items-center cursor-pointer p-4 bg-content1 rounded-lg hover:bg-content2 transition-colors">
                                    <span className="font-medium text-default-foreground">{faq.q}</span>
                                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <div className="p-4 text-default-600 bg-content1 border-t border-divider">{faq.a}</div>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default ShippingPage;
