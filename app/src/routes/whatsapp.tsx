import { createFileRoute, redirect } from '@tanstack/react-router'

const DEFAULT_MESSAGE = encodeURIComponent(`Hello 👋 I’m interested in your products. Please help me with details, pricing, availability, and delivery options. Thank you.`)

export const Route = createFileRoute('/whatsapp')({
    beforeLoad: ({ context }) => {
        const whatsappUrl = `https://wa.me/${context.config?.whatsapp}?text=${DEFAULT_MESSAGE}`

        if (typeof window !== 'undefined') {
            window.location.href = whatsappUrl
        }

        throw redirect({
            href: whatsappUrl,
        })
    },
    component: () => null,
})