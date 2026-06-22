import { createFileRoute } from "@tanstack/react-router";
import { BtnLink } from "@/components/ui/btnLink";
import { Separator } from "@/components/ui/separator";
import { useConfig } from "@/providers/store-provider";

export const Route = createFileRoute("/_mainLayout/(static)/privacy")({
    head: () => ({
        meta: [{ name: "description", content: "Privacy Policy" }, { title: "Privacy Policy" }],
    }),
    component: RouteComponent,
});

const Pill = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <div className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border bg-muted/40 text-muted-foreground">
        {icon}
        <span>{label}</span>
    </div>
);

function RouteComponent() {
    const config = useConfig();

    const collected = [
        { icon: "👤", label: "Name & email" },
        { icon: "📍", label: "Delivery address" },
        { icon: "💳", label: "Payment information" },
        { icon: "💻", label: "Device & browser data" },
        { icon: "📊", label: "Browsing & preferences" },
        { icon: "📌", label: "Location information" },
    ];

    const usages = [
        { icon: "📦", label: "Process & fulfill orders" },
        { icon: "✨", label: "Personalize your experience" },
        { icon: "🔧", label: "Improve our products" },
        { icon: "📣", label: "Send promotions & updates" },
    ];

    const rights = [
        { icon: "👁", title: "Access", desc: "Request a copy of the data we hold about you" },
        { icon: "✏️", title: "Correct", desc: "Update inaccurate or incomplete information" },
        { icon: "🗑", title: "Delete", desc: "Ask us to erase your personal data" },
        { icon: "🔕", title: "Opt out", desc: "Unsubscribe from marketing at any time" },
    ];

    return (
        <div>
            <div className="bg-card border-b">
                <div className="max-w-3xl mx-auto px-6 py-10">
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">Legal</p>
                    <h1 className="text-3xl font-medium mb-2">Privacy Policy</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        At {config?.shop_name}, we're committed to protecting your privacy and being transparent about how your data is used.
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-10 space-y-0">
                <div>
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">Introduction</p>
                    <h2 className="text-base font-medium mb-2">Your privacy matters</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        This Privacy Policy outlines how we collect, use, and safeguard your personal information when you use our website or
                        services. By using our site, you agree to the practices described here.
                    </p>
                </div>

                <Separator className="my-8" />

                <div>
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">Section 1</p>
                    <h2 className="text-base font-medium mb-2">Information we collect</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        We collect only what's necessary to deliver a smooth shopping experience. This includes:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {collected.map((item) => (
                            <Pill key={item.label} icon={item.icon} label={item.label} />
                        ))}
                    </div>
                </div>

                <Separator className="my-8" />

                <div>
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">Section 2</p>
                    <h2 className="text-base font-medium mb-2">How we use your information</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        Your data is used to run our service and improve your experience. Specifically:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {usages.map((item) => (
                            <Pill key={item.label} icon={item.icon} label={item.label} />
                        ))}
                    </div>
                </div>

                <Separator className="my-8" />

                <div>
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">Section 3</p>
                    <h2 className="text-base font-medium mb-2">Your rights</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">You are in control of your personal data at all times.</p>
                    <div className="grid grid-cols-2 gap-3">
                        {rights.map((r) => (
                            <div key={r.title} className="rounded-lg border bg-muted/40 px-4 py-3">
                                <p className="text-sm font-medium mb-1">
                                    <span className="mr-1.5">{r.icon}</span>
                                    <span>{r.title}</span>
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator className="my-8" />

                <div>
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">Section 4</p>
                    <h2 className="text-base font-medium mb-2">Contact us</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        Questions about this policy? Reach out and we'll respond promptly.
                    </p>
                    <div className="rounded-xl border bg-muted/40 px-5 py-4 space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-muted-foreground w-12">Email</span>
                            <a
                                href={`mailto:${config?.contact_email}`}
                                className="font-medium underline underline-offset-4 hover:text-foreground transition-colors"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {config?.contact_email}
                            </a>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-muted-foreground w-12">Phone</span>
                            <span className="font-medium">{config?.contact_phone}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-8 mt-8 border-t">
                    <span className="text-xs text-muted-foreground">
                        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </span>
                    <BtnLink href="/" size="sm">
                        ← Back home
                    </BtnLink>
                </div>
            </div>
        </div>
    );
}
