const PaymentTest = ({ className }: { className?: string }) => {
    return (
        <span
            className={`${className} bg-orange-100 text-orange-800 border-orange-300 items-center gap-x-0.5 border text-sm font-medium px-2 py-0.5 rounded-md`}
        >
            <span className="font-semibold">Attention:</span> For testing purposes only.
        </span>
    );
};

export default PaymentTest;
