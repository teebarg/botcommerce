import { createFileRoute } from "@tanstack/react-router";
import { BtnLink } from "@/components/ui/btnLink";
import { useConfig } from "@/providers/store-provider";

export const Route = createFileRoute("/_mainLayout/(static)/careers")({
    head: () => ({
        meta: [
            {
                name: "description",
                content: "Careers",
            },
            {
                title: "Careers",
            },
        ],
    }),
    component: RouteComponent,
});

function RouteComponent() {
    const { config } = useConfig();
    const jobOpenings: { title: string; location: string }[] = [
        // { title: "Store Manager", location: "New York, NY" },
        // { title: "Sales Associate", location: "Los Angeles, CA" },
        // { title: "Inventory Specialist", location: "Chicago, IL" },
        // { title: "Customer Service Representative", location: "Houston, TX" },
    ];

    return (
        <div>
            <div className="max-w-6xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold text-center mb-8 text-foreground">Career Opportunities at {config?.shop_name}</h1>

                <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Join Our Team</h2>
                    <p className="mb-4">
                        {`At ${config?.shop_name}, we're always looking for passionate individuals to join our growing family. We offer exciting career
                          opportunities, competitive benefits, and a supportive work environment.`}
                    </p>
                    <p className="mb-4">Explore our current openings and find the perfect role for you!</p>

                    {jobOpenings.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {jobOpenings?.map((job, index) => (
                                <div key={index} className="bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
                                    <h3 className="text-xl font-semibold mb-2 text-foreground">{job.title}</h3>
                                    <p className="mb-4 text-foreground">{job.location}</p>
                                    <BtnLink href="">Learn More</BtnLink>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-12">
                            <h3 className="text-2xl font-semibold mb-4 text-foreground">No Current Openings</h3>
                            <p className="text-muted-foreground mb-6">
                                {`We don't have any open positions at the moment, but we're always on the lookout for talent. Please check back later or
                                  submit your resume for future opportunities.`}
                            </p>
                            <BtnLink href="#" size="lg">
                                Submit Your Resume
                            </BtnLink>
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center">
                    <h2 className="text-2xl font-semibold mb-4 text-foreground">{`Don't see the right fit?`}</h2>
                    <p className="text-muted-foreground mb-6">
                        {`We're always interested in hearing from talented individuals. Send us your resume, and we'll keep you in mind for future
                          opportunities.`}
                    </p>
                    <BtnLink href="#" size="lg" variant="success">
                        Submit Your Resume
                    </BtnLink>
                </div>
            </div>
        </div>
    );
}
