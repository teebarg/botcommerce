import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { ImageUpload } from "./product-image-upload";
import { ProductDetailsForm } from "./product-details-form";
import { VariantCreation } from "./product-variant";
import { ProductReview } from "./product-review";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Product, ProductVariant } from "@/schemas";
import { api } from "@/apis/client";
import { useNavigate } from "@tanstack/react-router";

export interface ProductImage {
    id: string;
    file: File;
    url: string;
}

export interface ProductDetails {
    name: string;
    description: string;
    categories: { value: number; label: string }[];
    collections: { value: number; label: string }[];
    sku: string;
}

export type FormProduct = Omit<Partial<Product>, "images" | "variants" | "categories" | "collections"> & {
    categories: { value: number; label: string }[];
    collections: { value: number; label: string }[];
    images: ProductImage[];
    variants: ProductVariant[];
};

const STEPS = [
    { id: 1, title: "Images", description: "Upload product photos" },
    { id: 2, title: "Details", description: "Basic information" },
    { id: 3, title: "Variants", description: "Size, color, etc." },
    { id: 4, title: "Review", description: "Confirm & create" },
];

export function ProductCreator() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [product, setProduct] = useState<FormProduct>({
        name: "",
        description: "",
        categories: [],
        collections: [],
        sku: "",
        images: [],
        variants: [],
    });
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [lastPayload, setLastPayload] = useState<any | null>(null);

    const DRAFT_KEY = "product_creator_draft";

    const loadDraft = useCallback(() => {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);

            if (!raw) return;
            const draft = JSON.parse(raw);

            if (draft?.product) {
                setProduct((prev) => ({
                    ...prev,
                    ...draft.product,
                    images: (draft.product.images || []).map((img: any) => ({ id: img.id, url: img.url, file: undefined as any })),
                }));
            }
            if (draft?.currentStep) {
                setCurrentStep(draft.currentStep);
            }
        } catch {}
    }, []);

    const clearDraft = useCallback(() => {
        try {
            localStorage.removeItem(DRAFT_KEY);
        } catch {}
    }, []);

    const latestStateRef = useRef<{ product: FormProduct; currentStep: number; isCompleted: boolean }>({ product, currentStep, isCompleted });

    useEffect(() => {
        latestStateRef.current = { product, currentStep, isCompleted };
    }, [product, currentStep, isCompleted]);

    useEffect(() => {
        loadDraft();
        const handleBeforeUnload = () => {
            if (!latestStateRef.current.isCompleted) {
                try {
                    const draft = {
                        currentStep: latestStateRef.current.currentStep,
                        product: {
                            ...latestStateRef.current.product,
                            images: (latestStateRef.current.product.images || []).map((img) => ({ id: img.id, url: img.url })),
                        },
                    };

                    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
                } catch {}
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [loadDraft]);

    useEffect(() => {
        try {
            const draft = {
                currentStep,
                product: {
                    ...product,
                    images: (product.images || []).map((img) => ({ id: img.id, url: img.url })),
                },
            };

            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        } catch {}
    }, [product, currentStep]);

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

    const handleDetailsChange = (details: FormProduct) => {
        setProduct((prev) => ({ ...prev, ...details }));
    };

    const handleVariantsChange = (variants: ProductVariant[]) => {
        setProduct((prev) => ({ ...prev, variants }));
    };

    const handleCreateProduct = async () => {
        setIsLoading(true);
        try {
            setErrorMessage(null);
            const fileToBase64 = (file: File) =>
                new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();

                    reader.onload = () => resolve((reader.result as string).split(",")[1] || "");
                    reader.onerror = (e) => reject(e);
                    reader.readAsDataURL(file);
                });

            const imagesPayload = await Promise.all(
                (product.images || []).map(async (img) => ({
                    file: img.file ? await fileToBase64(img.file) : "",
                    file_name: img.file?.name || "image.jpg",
                    content_type: img.file?.type || "image/jpeg",
                }))
            );

            const variantsPayload = (product.variants || []).map((variant) => ({
                price: variant.price,
                old_price: variant.old_price,
                inventory: variant.inventory,
                size: (variant as any).size,
                color: (variant as any).color,
                measurement: (variant as any).measurement,
                age: (variant as any).age,
            }));

            const payload: any = {
                name: product.name,
                description: product.description,
                category_ids: product.categories?.map((c) => c.value) || [],
                collection_ids: product.collections?.map((c) => c.value) || [],
                images: imagesPayload.length ? imagesPayload : undefined,
                variants: variantsPayload.length ? variantsPayload : undefined,
            };

            setLastPayload(payload);
            await api.post("/product/create-bundle", payload);

            toast.success("Product created successfully");
            setIsCompleted(true);
            clearDraft();
        } catch (error: any) {
            toast.error(error?.message || "Failed to create product");
            console.error(error);
            setErrorMessage(error?.message || "Failed to create product");
        } finally {
            setIsLoading(false);
        }
    };

    const retryCreate = async () => {
        if (!lastPayload) return handleCreateProduct();
        setIsLoading(true);
        try {
            setErrorMessage(null);
            await api.post("/product/create-bundle", lastPayload);
            toast.success("Product created successfully");
            setIsCompleted(true);
            clearDraft();
        } catch (error: any) {
            toast.error(error?.message || "Failed to create product");
            setErrorMessage(error?.message || "Failed to create product");
        } finally {
            setIsLoading(false);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return product.images.length > 0;
            case 2:
                return product.name;
            case 3:
                return true;
            case 4:
                return true;
            default:
                return false;
        }
    };

    if (isCompleted) {
        return (
            <div className="flex justify-center px-4 py-8">
                <Card className="w-full max-w-md p-8 text-center bg-gradient-card shadow-medium">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-card-foreground">Product Created!</h2>
                    <p className="text-muted-foreground mb-6">{`Your product "${product.name}" has been successfully created.`}</p>
                    <div className="flex gap-2">
                        <Button className="w-full" variant="success" onClick={() => window.location.reload()}>
                            Create Another Product
                        </Button>
                        <Button className="w-full" onClick={() => navigate({to: "/admin/products"})}>
                            Go To Products
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="mb-4">
            <div className="bg-card shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold mb-2 text-card-foreground">Create Product</h1>
                        <Progress className="h-2" value={progress} />
                    </div>

                    <div className="flex justify-between">
                        {STEPS.map((step) => (
                            <div key={step.id} className="flex flex-col items-center flex-1">
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-smooth",
                                        step.id <= currentStep ? "bg-gradient-primary text-white shadow-sm" : "bg-muted text-muted-foreground"
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

            <div className="max-w-4xl mx-auto px-2 md:px-4 py-4">
                <Card className="bg-gradient-card shadow-medium border-0">
                    <div className="p-6">
                        {currentStep === 1 && <ImageUpload images={product.images} onImagesChange={handleImagesChange} />}
                        {currentStep === 2 && <ProductDetailsForm product={product} onDetailsChange={handleDetailsChange} />}
                        {currentStep === 3 && <VariantCreation variants={product.variants} onVariantsChange={handleVariantsChange} />}
                        {currentStep === 4 && <ProductReview product={product} />}
                        {currentStep === 4 && errorMessage && (
                            <div className="mt-4 p-4 border border-destructive/30 rounded-md bg-destructive/10">
                                <p className="text-destructive mb-3">{errorMessage}</p>
                                <div className="flex gap-2">
                                    <Button disabled={isLoading} isLoading={isLoading} variant="destructive" onClick={retryCreate}>
                                        Retry
                                    </Button>
                                    <Button variant="outline" onClick={() => setErrorMessage(null)}>
                                        Edit Details
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center px-6 sm:px-8 py-6 border-t border-border bg-contrast/20">
                        <Button className="flex items-center gap-2" disabled={currentStep === 1} variant="outline" onClick={handlePrevious}>
                            <ArrowLeft className="w-4 h-4" />
                            Previous
                        </Button>

                        <div className="text-sm text-muted-foreground">
                            Step {currentStep} of {STEPS.length}
                        </div>

                        {currentStep < STEPS.length ? (
                            <Button className="flex items-center gap-2" disabled={!canProceed()} variant="outline" onClick={handleNext}>
                                Next
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button disabled={!canProceed() || isLoading} isLoading={isLoading} variant="outline" onClick={handleCreateProduct}>
                                {errorMessage ? "Retry" : "Create Product"}
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
