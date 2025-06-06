import { Metadata } from "next";
// import { notFound } from "next/navigation";

// import { api } from "@/apis";
// import ServerError from "@/components/generic/server-error";
import ProfilePage from "@/components/store/account/profile";
import ClientOnly from "@/components/generic/client-only";

export const metadata: Metadata = {
    title: "Profile",
};

export default async function Profile() {
    // const { data: customer, error } = await api.user.me();

    // if (error) {
    //     return <ServerError />;
    // }

    // if (!customer) {
    //     notFound();
    // }

    return (
        <ClientOnly>
            <div className="w-full px-2 md:px-0" data-testid="profile-page-wrapper">
                <ProfilePage />
            </div>
        </ClientOnly>
    );
}
