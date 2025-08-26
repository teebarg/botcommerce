import { useState } from "react";
import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";

import { ImageUpload } from "./product-image-upload";
import { ProductDetailsForm } from "./product-details-form";
import { VariantCreation } from "./product-variant";
import { ProductReview } from "./product-review";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface ProductImage {
    id: string;
    file: File;
    url: string;
}

export interface ProductDetails {
    name: string;
    description: string;
    price: number;
    category: string;
    sku: string;
}

export interface ProductVariant {
    id: string;
    name: string;
    type: "size" | "color" | "style";
    value: string;
    priceModifier: number;
    stock: number;
}

export interface Product {
    images: ProductImage[];
    details: ProductDetails;
    variants: ProductVariant[];
}

const STEPS = [
    { id: 1, title: "Images", description: "Upload product photos" },
    { id: 2, title: "Details", description: "Basic information" },
    { id: 3, title: "Variants", description: "Size, color, etc." },
    { id: 4, title: "Review", description: "Confirm & create" },
];

export function ProductCreator() {
    const [currentStep, setCurrentStep] = useState(1);
    const [product, setProduct] = useState<Product>({
        images: [],
        details: {
            name: "",
            description: "",
            price: 0,
            category: "",
            sku: "",
        },
        variants: [],
    });
    const [isCompleted, setIsCompleted] = useState(false);

    const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleImagesChange = (images: ProductImage[]) => {
        setProduct((prev) => ({ ...prev, images }));
    };

    const handleDetailsChange = (details: ProductDetails) => {
        setProduct((prev) => ({ ...prev, details }));
    };

    const handleVariantsChange = (variants: ProductVariant[]) => {
        setProduct((prev) => ({ ...prev, variants }));
    };

    const handleCreateProduct = () => {
        // Here you would typically send the product to your backend
        console.log("Creating product:", product);
        setIsCompleted(true);
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return product.images.length > 0;
            case 2:
                return product.details.name && product.details.description && product.details.price > 0;
            case 3:
                return true; // Variants are optional
            case 4:
                return true;
            default:
                return false;
        }
    };

    if (isCompleted) {
        return (
            <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-8 text-center bg-gradient-card shadow-medium">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-card-foreground">Product Created!</h2>
                    <p className="text-muted-foreground mb-6">Your product "{product.details.name}" has been successfully created.</p>
                    <Button
                        className="w-full bg-gradient-primary hover:shadow-medium transition-all duration-smooth"
                        onClick={() => window.location.reload()}
                    >
                        Create Another Product
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-subtle">
            {/* Header with Progress */}
            <div className="bg-card shadow-soft">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold mb-2 text-card-foreground">Create New Product</h1>
                        <Progress className="h-2" value={progress} />
                    </div>

                    {/* Steps Indicator */}
                    <div className="flex justify-between">
                        {STEPS.map((step) => (
                            <div key={step.id} className="flex flex-col items-center flex-1">
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-smooth",
                                        step.id <= currentStep ? "bg-gradient-primary text-white shadow-soft" : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {step.id}
                                </div>
                                <div className="mt-2 text-center">
                                    <div
                                        className={cn(
                                            "text-sm font-medium transition-colors duration-smooth",
                                            step.id <= currentStep ? "text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        {step.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground hidden sm:block">{step.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Card className="bg-gradient-card shadow-medium border-0">
                    <div className="p-6 sm:p-8">
                        {currentStep === 1 && <ImageUpload images={product.images} onImagesChange={handleImagesChange} />}
                        {currentStep === 2 && <ProductDetailsForm details={product.details} onDetailsChange={handleDetailsChange} />}
                        {currentStep === 3 && <VariantCreation variants={product.variants} onVariantsChange={handleVariantsChange} />}
                        {currentStep === 4 && <ProductReview product={product} onCreateProduct={handleCreateProduct} />}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center px-6 sm:px-8 py-6 border-t border-border bg-accent/30">
                        <Button className="flex items-center gap-2" disabled={currentStep === 1} variant="outline" onClick={handlePrevious}>
                            <ArrowLeft className="w-4 h-4" />
                            Previous
                        </Button>

                        <div className="text-sm text-muted-foreground">
                            Step {currentStep} of {STEPS.length}
                        </div>

                        {currentStep < STEPS.length ? (
                            <Button
                                className="flex items-center gap-2 bg-gradient-primary hover:shadow-medium transition-all duration-smooth"
                                disabled={!canProceed()}
                                onClick={handleNext}
                            >
                                Next
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                className="bg-gradient-primary hover:shadow-medium transition-all duration-smooth"
                                disabled={!canProceed()}
                                onClick={handleCreateProduct}
                            >
                                Create Product
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
