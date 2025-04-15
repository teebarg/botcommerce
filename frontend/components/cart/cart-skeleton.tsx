"use client";

export default function CartSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_360px] gap-x-8 pt-4">
            {/* Left side - Cart Items */}
            <div className="flex flex-col bg-content1 p-4 gap-y-6 rounded-md h-96 animate-pulse" />

            {/* Right side - Summary */}
            <div className="relative hidden md:block">
                <div className="flex flex-col gap-y-8 sticky top-12">
                    <div className="bg-content1 px-6 py-6 rounded-md space-y-4 h-72 animate-pulse" />
                </div>
            </div>
        </div>
    );
}
