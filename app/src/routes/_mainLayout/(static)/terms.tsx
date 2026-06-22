import { createFileRoute } from "@tanstack/react-router";
import { BtnLink } from "@/components/ui/btnLink";
import { Separator } from "@/components/ui/separator";
import { useConfig } from "@/providers/store-provider";

export const Route = createFileRoute("/_mainLayout/(static)/terms")({
    head: () => ({
        meta: [
            { name: "description", content: "Terms and Conditions" },
            { title: "Terms and Conditions" },
        ],
    }),
    component: RouteComponent,
});

function RouteComponent() {
    const config = useConfig();

    const sections = [
        {
            num: "Section 1",
            title: "License to use",
            body: `Unless otherwise stated, ${config?.shop_name} Stores and/or its licensors own the intellectual property rights for all material on this website. All intellectual property rights are reserved. You may view and/or print pages for your own personal use, subject to the restrictions set in these terms and conditions.`,
        },
        {
            num: "Section 2",
            title: "User comments",
            body: `Certain parts of this website allow users to post and exchange opinions, information, and data. ${config?.shop_name} Stores does not screen, edit, publish, or review comments prior to their appearance on the website. Comments reflect the view and opinion of the person who posts them and do not represent the views of ${config?.shop_name} Stores, its agents, or affiliates.`,
        },
        {
            num: "Section 3",
            title: "Reservation of rights",
            body: `We reserve the right at any time and at our sole discretion to request that you remove all links or any particular link to our website. We also reserve the right to amend these terms and conditions at any time. By continuing to use this website, you agree to be bound by the current version of these terms.`,
        },
    ];

    return (
        <div className="max-w-3xl mx-auto px-6 py-10">
            <div className="pb-8 border-b">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">Legal</p>
                <h1 className="text-3xl font-medium mb-2">Terms and Conditions</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    By using this website, you agree to the following terms. Please read them carefully before placing an order.
                </p>
            </div>

            <div className="pt-8 pb-2">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">Introduction</p>
                <h2 className="text-base font-medium mb-2">Welcome to {config?.shop_name} Stores</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    These terms and conditions outline the rules and regulations for the use of {config?.shop_name} Stores' website
                    and services. By accessing this website, you accept these terms in full. Do not continue to use this site if you
                    do not agree to all of the terms stated on this page.
                </p>
            </div>

            {sections.map(({ num, title, body }) => (
                <div key={num}>
                    <Separator className="my-6" />
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">{num}</p>
                    <h2 className="text-base font-medium mb-2">{title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
            ))}

            <Separator className="my-6" />
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">Section 4</p>
            <h2 className="text-base font-medium mb-2">Contact information</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                If you have any questions about these terms, reach out to us directly.
            </p>
            <div className="rounded-xl border bg-muted/40 px-5 py-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground w-12">Email</span>
                    <a
                        href={`mailto:${config?.contact_email}`}
                        className="font-medium hover:underline underline-offset-4"
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

            <div className="mt-10 pt-6 border-t flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
                <BtnLink href="/" size="sm" className="gap-1.5">
                    ← Back home
                </BtnLink>
            </div>
        </div>
    );
}