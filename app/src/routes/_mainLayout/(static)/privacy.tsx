import { createFileRoute } from "@tanstack/react-router";
import { BtnLink } from "@/components/ui/btnLink";
import { useConfig } from "@/providers/store-provider";

export const Route = createFileRoute("/_mainLayout/(static)/privacy")({
    head: () => ({
        meta: [
            {
                name: "description",
                content: "Privacy Policy",
            },
            {
                title: "Privacy Policy",
            },
        ],
    }),
    component: RouteComponent,
});

function RouteComponent() {
    const { config } = useConfig();

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-center text-foreground">Privacy Policy</h1>

            <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-foreground">Your Privacy Matters</h2>
                <p className="mb-4 text-foreground">
                    At {config?.shop_name}, we are committed to protecting your privacy and ensuring the security of your personal information. This
                    Privacy Policy outlines how we collect, use, and safeguard your data when you use our website or services.
                </p>
                <h2 className="text-xl font-semibold mb-4 text-foreground">Information We Collect</h2>
                <ul className="list-disc pl-6 mb-4 text-foreground">
                    <li className="mb-2">Personal information (name, email, address)</li>
                    <li className="mb-2">Payment information</li>
                    <li className="mb-2">Browsing history and preferences</li>
                    <li className="mb-2">Device and location information</li>
                </ul>
                <h2 className="text-xl font-semibold mb-4 text-foreground">How We Use Your Information</h2>
                <ul className="list-disc pl-6 mb-4 text-foreground">
                    <li className="mb-2">To process and fulfill your orders</li>
                    <li className="mb-2">To improve our products and services</li>
                    <li className="mb-2">To personalize your shopping experience</li>
                    <li className="mb-2">To communicate with you about promotions and updates</li>
                </ul>
                <h2 className="text-xl font-semibold mb-4 text-foreground">Your Rights</h2>
                <p className="mb-4 text-foreground">
                    You have the right to access, correct, or delete your personal information. You can also opt-out of marketing communications at
                    any time.
                </p>
                <h2 className="text-xl font-semibold mb-4 text-foreground">Contact Us</h2>
                <p className="mb-4 text-foreground">If you have any questions about our Privacy Policy, please contact us at:</p>
                <p className="text-foreground">
                    Email:{" "}
                    <a className="text-primary hover:underline" href={`mailto:${config?.contact_email}`} rel="noreferrer" target="_blank">
                        {config?.contact_email}
                    </a>
                </p>
                <p className="text-foreground">
                    Phone: <span className="font-semibold">{config?.contact_phone}</span>
                </p>
            </div>

            <div className="mt-8 text-center">
                <BtnLink href="/" size="lg">
                    Back Home
                </BtnLink>
            </div>
        </div>
    );
}
