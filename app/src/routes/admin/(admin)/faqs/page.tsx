import { Metadata } from "next";

import FaqView from "@/components/admin/faq/faq-view";

export const metadata: Metadata = {
    title: "FAQs",
};

export default async function FaqPage() {
    return <FaqView />;
}
