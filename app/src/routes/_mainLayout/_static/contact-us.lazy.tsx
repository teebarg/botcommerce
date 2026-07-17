import ContactSection from '@/components/store/landing/contact-section';
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_mainLayout/_static/contact-us')({
    component: RouteComponent,
})

function RouteComponent() {
    return <ContactSection />;
}
