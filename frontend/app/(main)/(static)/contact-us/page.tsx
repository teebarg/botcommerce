import { Metadata } from "next";

import { ContactSection } from "@/components/store/landing/contact-section";

export const metadata: Metadata = {
    title: "Contact Us",
};

const ContactUsPage = () => {
    return <ContactSection />;
};

export default ContactUsPage;
