import React from "react";
import { getSiteConfig } from "@lib/config";

import { BtnLink } from "@/components/ui/btnLink";

const UserAgreement = async () => {
    const siteConfig = await getSiteConfig();

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-center text-foreground">{siteConfig.name} User Agreement</h1>

            <div className="bg-content1 rounded-lg shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Welcome to {siteConfig.name}</h2>
                <p className="mb-4 text-foreground">
                    {`This User Agreement ("Agreement") is a contract between you and ${siteConfig.name}. By using our website or services, you agree to be
                    bound by the terms of this Agreement. Please read it carefully.`}
                </p>
                <h2 className="text-xl font-semibold mb-4 text-foreground">1. Account Registration</h2>
                <p className="mb-4 text-foreground">
                    To use certain features of our service, you may be required to register for an account. You agree to provide accurate, current,
                    and complete information during the registration process and to update such information to keep it accurate, current, and
                    complete.
                </p>
                <h2 className="text-xl font-semibold mb-4 text-foreground">2. User Conduct</h2>
                <p className="mb-4 text-foreground">You agree not to engage in any of the following prohibited activities:</p>
                <ul className="list-disc pl-6 mb-4 text-foreground">
                    <li className="mb-2">Copying, distributing, or disclosing any part of the service in any medium</li>
                    <li className="mb-2">Using any automated system to access the service</li>
                    <li className="mb-2">Attempting to interfere with the proper working of the service</li>
                    <li>Impersonating another person or entity</li>
                </ul>
                <h2 className="text-xl font-semibold mb-4 text-foreground">3. Intellectual Property</h2>
                <p className="mb-4 text-foreground">
                    The service and its original content, features, and functionality are owned by {siteConfig.name} and are protected by
                    international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
                </p>
                <h2 className="text-xl font-semibold mb-4 text-foreground">4. Termination</h2>
                <p className="mb-4 text-foreground">
                    We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our
                    sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Agreement.
                </p>
                <h2 className="text-xl font-semibold mb-4 text-foreground">5. Changes to This Agreement</h2>
                <p className="mb-4 text-foreground">
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our
                    service after any revisions become effective, you agree to be bound by the revised terms.
                </p>
            </div>

            <div className="mt-8 text-center">
                <BtnLink color="primary" href="/">
                    Back to Home
                </BtnLink>
            </div>
        </div>
    );
};

export default UserAgreement;
