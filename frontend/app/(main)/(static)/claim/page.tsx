import React from "react";
import { getSiteConfig } from "@lib/config";
import { Metadata } from "next";

import { BtnLink } from "@/components/ui/btnLink";

export const metadata: Metadata = {
    title: "Claims",
};

const Claim: React.FC = async () => {
    const siteConfig = await getSiteConfig();

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-center text-foreground">{siteConfig.name} Claims Process</h1>

            <div className="bg-content1 rounded-lg shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">How to File a Claim</h2>
                <p className="mb-4 text-foreground">
                    {`At ${siteConfig.name}, we strive to ensure your complete satisfaction with every purchase. If you've encountered any issues with your
                    order, we're here to help. Please follow these steps to file a claim:`}
                </p>
                <ol className="list-decimal pl-6 mb-4 text-foreground">
                    <li className="mb-2">Gather your order information, including order number and date of purchase.</li>
                    <li className="mb-2">Take clear photos of the item(s) in question, if applicable.</li>
                    <li className="mb-2">Fill out our online claim form with all relevant details.</li>
                    <li className="mb-2">Our customer service team will review your claim within 48 hours.</li>
                    <li>{`If approved, we'll process your claim and provide you with the necessary instructions for returning the item(s).`}</li>
                </ol>
            </div>

            <div className="bg-content1 rounded-lg shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Types of Claims We Handle</h2>
                <ul className="list-disc pl-6 mb-4 text-foreground">
                    <li className="mb-2">Damaged or defective items</li>
                    <li className="mb-2">Missing items from your order</li>
                    <li className="mb-2">Incorrect items received</li>
                    <li className="mb-2">Late deliveries</li>
                    <li>Quality issues</li>
                </ul>
            </div>

            <div className="text-center">
                <BtnLink href="/claim-form">File a Claim Now</BtnLink>
            </div>

            <div className="mt-12 bg-content1 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Need Additional Help?</h2>
                <p className="mb-4 text-foreground">
                    If you have any questions about the claims process or need assistance, our customer service team is here to help.
                </p>
                <p className="text-foreground">
                    Contact us at:{" "}
                    <a className="text-primary hover:underline" href={`mailto:${siteConfig.contactEmail}`} rel="noreferrer" target="_blank">
                        {siteConfig.contactEmail}
                    </a>{" "}
                    or call us at <span className="font-semibold">{siteConfig.contactPhone}</span>
                </p>
            </div>
        </div>
    );
};

export default Claim;
