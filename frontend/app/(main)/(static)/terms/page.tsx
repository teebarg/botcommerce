import React from "react";
import { getSiteConfig } from "@lib/config";
import { Metadata } from "next";

import { BtnLink } from "@/components/ui/btnLink";

export const dynamic = "force-static";

export const metadata: Metadata = {
    title: "Terms and Conditions",
};

const Terms = async () => {
    const siteConfig = await getSiteConfig();

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-center text-foreground">Terms and Conditions</h1>

            <div className="bg-content1 rounded-lg shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Welcome to {siteConfig.name} Stores</h2>
                <p className="mb-4 text-foreground">
                    {`These terms and conditions outline the rules and regulations for the use of ${siteConfig.name} Stores' website and services. By accessing this
                    website, we assume you accept these terms and conditions in full. Do not continue to use ${siteConfig.name} Stores' website if you do not accept
                    all of the terms and conditions stated on this page.`}
                </p>
                <h2 className="text-xl font-semibold mb-4 text-foreground">1. License to Use</h2>
                <p className="mb-4 text-foreground">
                    Unless otherwise stated, {siteConfig.name} Stores and/or its licensors own the intellectual property rights for all material on
                    {siteConfig.name} Stores. All intellectual property rights are reserved. You may view and/or print pages from{" "}
                    <span className="underline">{siteConfig.baseUrl}</span> for your own personal use subject to restrictions set in these terms and
                    conditions.
                </p>
                <h2 className="text-xl font-semibold mb-4 text-foreground">2. User Comments</h2>
                <p className="mb-4 text-foreground">
                    {`Certain parts of this website offer the opportunity for users to post and exchange opinions, information, material and data
                    ('Comments') in areas of the website. ${siteConfig.name} Stores does not screen, edit, publish or review Comments prior to their appearance on
                    the website and Comments do not reflect the views or opinions of ${siteConfig.name} Stores, its agents or affiliates. Comments reflect the view
                    and opinion of the person who posts such view or opinion.`}
                </p>
                <h2 className="text-xl font-semibold mb-4 text-foreground">3. Reservation of Rights</h2>
                <p className="mb-4 text-foreground">
                    We reserve the right at any time and in its sole discretion to request that you remove all links or any particular link to our Web
                    site. You agree to immediately remove all links to our Web site upon such request. We also reserve the right to amend these terms
                    and conditions and its linking policy at any time. By continuing to link to our Web site, you agree to be bound to and abide by
                    these linking terms and conditions.
                </p>
                <h2 className="text-xl font-semibold mb-4 text-foreground">4. Contact Information</h2>
                <p className="mb-4 text-foreground">If you have any questions about these Terms, please contact us at:</p>
                <p className="text-foreground">
                    Email:{" "}
                    <a className="text-primary hover:underline" href={`mailto:${siteConfig.contactEmail}`} rel="noreferrer" target="_blank">
                        {siteConfig.contactEmail}
                    </a>
                </p>
                <p className="text-foreground">
                    Phone: <span className="font-semibold">{siteConfig.contactPhone}</span>
                </p>
            </div>

            <div className="mt-8 text-center">
                <BtnLink color="primary" href="/" size="md">
                    Back Home
                </BtnLink>
            </div>
        </div>
    );
};

export default Terms;
