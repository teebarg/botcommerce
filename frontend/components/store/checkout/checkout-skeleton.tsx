"use client";

export default function CheckoutSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_360px] gap-x-8 px-52 pt-10">
            {/* Left side - Cart Items */}
            <div className="flex flex-col bg-content1 p-4 gap-y-6 rounded-md h-192 animate-pulse mt-14" />

            {/* Right side - Summary */}
            <div className="relative hidden md:block">
                <div className="flex flex-col gap-y-8">
                    <div className="bg-content1 px-6 py-6 rounded-md space-y-4 h-160 animate-pulse" />
                </div>
            </div>
        </div>
    );
}
