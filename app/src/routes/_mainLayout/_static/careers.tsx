import { createFileRoute } from "@tanstack/react-router";
import { BtnLink } from "@/components/ui/btnLink";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_mainLayout/_static/careers")({
    head: () => ({
        meta: [{ name: "description", content: "Careers" }, { title: "Careers" }],
    }),
    component: RouteComponent,
});

const perks = [
    {
        icon: "🏆",
        title: "Competitive pay",
        sub: "Fair compensation and performance bonuses",
        color: "bg-blue-50 text-blue-700",
    },
    {
        icon: "🤝",
        title: "Great team culture",
        sub: "A supportive, inclusive environment to thrive in",
        color: "bg-emerald-50 text-emerald-700",
    },
    {
        icon: "📈",
        title: "Room to grow",
        sub: "Clear paths for advancement and development",
        color: "bg-violet-50 text-violet-700",
    },
];

function RouteComponent() {
    const jobOpenings: { title: string; location: string }[] = [
        // { title: "Store Manager", location: "New York, NY" },
    ];

    return (
        <div>
            <div className="bg-card border-b">
                <div className="max-w-3xl mx-auto px-6 py-10">
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">Careers</p>
                    <h1 className="text-3xl font-medium mb-2">Join our team</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        We're always looking for passionate people to help us grow. Explore opportunities below.
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-10">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">Why work with us</p>
                <div className="grid grid-cols-3 gap-3">
                    {perks.map((p) => (
                        <div key={p.title} className="rounded-xl border bg-muted/40 p-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 text-sm ${p.color}`}>{p.icon}</div>
                            <p className="text-sm font-medium mb-1">{p.title}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{p.sub}</p>
                        </div>
                    ))}
                </div>

                <Separator className="my-8" />

                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">Open positions</p>

                {jobOpenings.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-3">
                        {jobOpenings.map((job, i) => (
                            <div key={i} className="rounded-xl border bg-muted/40 p-5 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium mb-1">{job.title}</p>
                                    <p className="text-xs text-muted-foreground">{job.location}</p>
                                </div>
                                <BtnLink href="" size="sm" className="shrink-0">
                                    Learn more
                                </BtnLink>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border bg-muted/40 px-6 py-12 text-center">
                        <div className="w-12 h-12 rounded-full border bg-card flex items-center justify-center mx-auto mb-4 text-xl">💼</div>
                        <p className="text-sm font-medium mb-2">No openings right now</p>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto mb-6">
                            We don't have any open positions at the moment, but we're always on the lookout for great talent. Check back soon or send
                            us your resume.
                        </p>
                        <BtnLink href="#" size="sm">
                            Submit your resume
                        </BtnLink>
                    </div>
                )}

                <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-5 py-4 mt-4">
                    <div>
                        <p className="font-medium text-sm">Don't see the right fit?</p>
                        <p className="text-xs text-muted-foreground mt-0.5">We keep strong candidates on file for future roles</p>
                    </div>
                    <BtnLink href="#" size="sm" className="shrink-0">
                        Send your resume
                    </BtnLink>
                </div>
            </div>
        </div>
    );
}
