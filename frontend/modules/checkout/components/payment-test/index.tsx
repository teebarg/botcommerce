import { cn } from "@/lib/util/cn";

const PaymentTest = ({ className }: { className?: string }) => {
    return (
        <span
            className={cn(
                "bg-orange-100 text-orange-800 border-orange-300 items-center gap-x-0.5 border text-sm font-medium px-2 py-0.5 rounded-md",
                className
            )}
        >
            <span className="font-semibold">Attention:</span> For testing purposes only.
        </span>
    );
};

export default PaymentTest;
