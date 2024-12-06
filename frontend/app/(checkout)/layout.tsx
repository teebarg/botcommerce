export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative" data-testid="checkout-container">
            {children}
        </div>
    );
}
