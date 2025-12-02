export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex-1 grid" data-testid="checkout-container">
            {children}
        </div>
    );
}
