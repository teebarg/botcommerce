import { Metadata } from "next";

import OverviewTemplate from "@/components/store/account/overview";

export const metadata: Metadata = {
    title: "Account",
    description: "Overview of your account activity.",
};

export default async function OverviewPage() {
    return <OverviewTemplate />;
}
