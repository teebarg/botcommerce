import { Metadata } from "next";

import ClientOnly from "@/components/generic/client-only";
import FaqView from "@/components/admin/faq/faq-view";

export const metadata: Metadata = {
    title: "FAQs",
};

export default async function FaqPage() {
    return (
        <ClientOnly>
            <FaqView />
        </ClientOnly>
    );
}
