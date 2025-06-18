import { type Metadata } from "next";

import UnderConstruction from "@/components/under-construction";

export const metadata: Metadata = {
    title: "About",
};

export default async function About() {
    return <UnderConstruction />;
}
