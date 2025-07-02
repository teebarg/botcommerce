import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle } from "lucide-react";

const ReturnsPage = () => (
    <div>
        <div className="bg-content1">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-default-foreground">Returns & Exchanges</h1>
                <p className="text-default-600 mt-1">Easy returns within 30 days of purchase</p>
            </div>
        </div>

        <Separator />

        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="space-y-8">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-600 mt-1 mr-3" />
                        <div>
                            <h3 className="text-lg font-semibold text-green-900 mb-2">30-Day Return Policy</h3>
                            <p className="text-green-800">
                                We offer hassle-free returns within 30 days of purchase for most items in original condition.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-content2 rounded-xl shadow-sm border border-divider p-8">
                    <h2 className="text-xl font-semibold text-default-900 mb-6">Return Process</h2>
                    <div className="space-y-6">
                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                                <span className="text-blue-600 font-semibold text-sm">1</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-default-foreground">Initiate Return</h3>
                                <p className="text-default-600">Fill out the return form above with your order details</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                                <span className="text-blue-600 font-semibold text-sm">2</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-default-foreground">Print Label</h3>
                                <p className="text-default-600">{`We'll email you a prepaid return shipping label`}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                                <span className="text-blue-600 font-semibold text-sm">3</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-default-foreground">Ship Item</h3>
                                <p className="text-default-600">Package the item and drop it off at any shipping location</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                                <span className="text-blue-600 font-semibold text-sm">4</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-default-foreground">Get Refund</h3>
                                <p className="text-default-600">Receive your refund within 3-5 business days after we receive the item</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-start">
                        <AlertCircle className="h-6 w-6 text-yellow-600 mt-1 mr-3" />
                        <div>
                            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Return Requirements</h3>
                            <ul className="text-yellow-800 space-y-1">
                                <li>• Items must be in original condition with tags attached</li>
                                <li>• Electronics must include all original accessories and packaging</li>
                                <li>• Some items like personalized products are not returnable</li>
                                <li>• Clearance items are final sale unless defective</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default ReturnsPage;
