import { Metadata } from "next";

import ProfilePage from "@/components/store/account/profile";

export const metadata: Metadata = {
    title: "Profile",
};

export default async function Profile() {
    return (
        <div className="w-full px-2 md:px-0" data-testid="profile-page-wrapper">
            <ProfilePage />
        </div>
    );
}
