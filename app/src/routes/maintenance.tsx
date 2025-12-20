import CountdownTimer from "@/components/maintenance/CountdownTimer";
import MaintenanceIllustration from "@/components/maintenance/MaintenanceIllustration";
import MaintenanceProgress from "@/components/maintenance/MaintenanceProgress";
import { ThemeToggle } from "@/components/theme-toggle";
import { useConfig } from "@/providers/store-provider";
import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Twitter, Facebook } from "lucide-react";
import { ShoppingBag } from "lucide-react";
import { useMemo } from "react";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/maintenance")({
    beforeLoad: async () => {
        if (process.env.MAINTENANCE_MODE !== "true") {
            throw redirect({ to: "/" });
        }
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { config } = useConfig();
    const { startDate, endDate } = useMemo(() => {
        const start = new Date();
        start.setHours(start.getHours() - 1);
        const end = new Date();
        end.setHours(end.getHours() + 2);
        end.setMinutes(end.getMinutes() + 30);
        return { startDate: start, endDate: end };
    }, []);

    const links = [
        { icon: Instagram, href: `https://www.instagram.com/${config?.instagram}`, label: "Instagram" },
        { icon: Twitter, href: `https://x.com/${config?.twitter}`, label: "Twitter" },
        { icon: Facebook, href: `https://web.facebook.com/profile.php?id=${config?.facebook}`, label: "Facebook" },
    ];

    return (
        <div className="min-h-screen gradient-hero flex flex-col">
            <div className="fixed top-8 right-4">
                <ThemeToggle />
            </div>
            <main className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="max-w-4xl w-full">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        <div className="flex-1 text-center lg:text-left space-y-6 animate-fade-in">
                            <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
                                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shadow-glow">
                                    <ShoppingBag className="w-6 h-6 text-accent-foreground" />
                                </div>
                                <span className="text-2xl font-display font-bold text-foreground">{config?.shop_name}</span>
                            </div>

                            <div className="space-y-2">
                                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                    We'll be right back
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
                                We're making things <span className="text-primary">better</span>
                            </h1>

                            <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
                                Our store is currently undergoing scheduled maintenance. We're working hard to improve your shopping experience.
                            </p>
                            <div className="py-4">
                                <p className="text-sm text-muted-foreground mb-4">Time remaining:</p>
                                <CountdownTimer targetDate={endDate} />
                            </div>
                            <div className="flex justify-center lg:justify-start py-2">
                                <MaintenanceProgress startDate={startDate} endDate={endDate} />
                            </div>
                        </div>
                        <div className="shrink-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                            <MaintenanceIllustration />
                        </div>
                    </div>
                </div>
            </main>
            <footer className="px-6 py-8 border-t border-border/50">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-muted-foreground">
                        Questions? Contact us at{" "}
                        <a href={`mailto:${config?.contact_email}`} className="text-contrast hover:underline">
                            {config?.contact_email}
                        </a>
                    </p>
                    <div className="flex items-center gap-4">
                        {links.map(({ icon: Icon, href, label }) => (
                            <a
                                key={label}
                                href={href}
                                aria-label={label}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary hover:bg-accent hover:text-accent-foreground transition-all duration-300 text-muted-foreground"
                            >
                                <Icon className="w-5 h-5" />
                            </a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
