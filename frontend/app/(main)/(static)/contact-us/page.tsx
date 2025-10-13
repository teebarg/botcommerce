import { Metadata } from "next";

import { ContactSection } from "@/components/LazyClient";

export const metadata: Metadata = {
    title: "Contact Us",
};

const ContactUsPage = async () => {
    return <ContactSection />;
};

export default ContactUsPage;
