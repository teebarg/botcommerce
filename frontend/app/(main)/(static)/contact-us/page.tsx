import { ContactSection } from "@/components/store/landing/contact-section";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us",
};

const ContactUsPage = () => {
    return <ContactSection />;
};

export default ContactUsPage;
