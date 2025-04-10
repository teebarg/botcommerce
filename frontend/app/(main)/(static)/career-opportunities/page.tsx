import React from "react";
import { getSiteConfig } from "@lib/config";

import { BtnLink } from "@/components/ui/btnLink";

const CareerOpportunities = async () => {
    const siteConfig = await getSiteConfig();
    const jobOpenings: { title: string; location: string }[] = [
        // { title: "Store Manager", location: "New York, NY" },
        // { title: "Sales Associate", location: "Los Angeles, CA" },
        // { title: "Inventory Specialist", location: "Chicago, IL" },
        // { title: "Customer Service Representative", location: "Houston, TX" },
    ];

    return (
        <div className="bg-background">
            <div className="max-w-6xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold text-center mb-8 text-foreground">Career Opportunities at {siteConfig.name}</h1>

                <div className="bg-content1 rounded-lg shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Join Our Team</h2>
                    <p className="mb-4">
                        {`At ${siteConfig.name}, we're always looking for passionate individuals to join our growing family. We offer exciting career
                        opportunities, competitive benefits, and a supportive work environment.`}
                    </p>
                    <p className="mb-4">Explore our current openings and find the perfect role for you!</p>

                    {jobOpenings.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {jobOpenings?.map((job, index) => (
                                <div key={index} className="bg-content1 rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
                                    <h3 className="text-xl font-semibold mb-2 text-foreground">{job.title}</h3>
                                    <p className="mb-4 text-foreground">{job.location}</p>
                                    <BtnLink color="primary" href="">
                                        Learn More
                                    </BtnLink>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-12">
                            <h3 className="text-2xl font-semibold mb-4 text-foreground">No Current Openings</h3>
                            <p className="text-default-500 mb-6">
                                {`We don't have any open positions at the moment, but we're always on the lookout for talent. Please check back later or
                                submit your resume for future opportunities.`}
                            </p>
                            <BtnLink color="primary" href="">
                                Submit Your Resume
                            </BtnLink>
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center">
                    <h2 className="text-2xl font-semibold mb-4 text-foreground">{`Don't see the right fit?`}</h2>
                    <p className="text-default-500 mb-6">
                        {`We're always interested in hearing from talented individuals. Send us your resume, and we'll keep you in mind for future
                        opportunities.`}
                    </p>
                    <BtnLink color="success" href="">
                        Submit Your Resume
                    </BtnLink>
                </div>
            </div>
        </div>
    );
};

export default CareerOpportunities;
