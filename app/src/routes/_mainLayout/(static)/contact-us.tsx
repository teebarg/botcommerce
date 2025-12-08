import ContactSection from '@/components/store/landing/contact-section';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_mainLayout/(static)/contact-us')({
    head: () => ({
        meta: [
            {
                name: "description",
                content: "Contact Us",
            },
            {
                title: "Contact Us",
            },
        ],
    }),
    component: RouteComponent,
})

function RouteComponent() {
    return <ContactSection />;
}
