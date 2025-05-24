import React from "react";
import { Metadata } from "next";

import ClientOnly from "@/components/generic/client-only";
import ActivityView from "@/components/generic/activities/activity-view";

export const metadata: Metadata = {
    title: "Activities",
};

export default async function ActivitiesPage() {
    return (
        <ClientOnly>
            <ActivityView />
        </ClientOnly>
    );
}
