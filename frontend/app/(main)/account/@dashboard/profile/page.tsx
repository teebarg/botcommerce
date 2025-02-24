import { Metadata } from "next";
// import ProfilePhone from "@modules/account//components/profile-phone";
import ProfileBillingAddress from "@modules/account/components/profile-billing-address";
import ProfileEmail from "@modules/account/components/profile-email";
import ProfileName from "@modules/account/components/profile-name";
import ProfilePassword from "@modules/account/components/profile-password";
import { notFound } from "next/navigation";

import { api } from "@/apis";

export const metadata: Metadata = {
    title: "Profile",
    description: "View and edit your Store profile.",
};

export default async function Profile() {
    const customer = await api.user.me();

    if (!customer) {
        notFound();
    }

    return (
        <div className="w-full px-2 md:px-0" data-testid="profile-page-wrapper">
            <div className="mb-8">
                <h1 className="text-xl font-semibold">Profile</h1>
                <p className="text-base">
                    View and update your profile information, including your name, email, and phone number. You can also update your billing address,
                    or change your password.
                </p>
            </div>
            <div className="flex flex-col gap-y-8 w-full">
                <ProfileName customer={customer} />
                <hr className="tb-divider" />
                <ProfileEmail customer={customer} />
                {/* <hr className="tb-divider" />
                <ProfilePhone customer={customer} /> */}
                <hr className="tb-divider" />
                <ProfilePassword customer={customer} />
                <hr className="tb-divider" />
                <ProfileBillingAddress customer={customer} />
            </div>
        </div>
    );
}
