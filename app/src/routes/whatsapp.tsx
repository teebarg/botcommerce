import { createFileRoute, redirect } from '@tanstack/react-router'

const DEFAULT_MESSAGE = encodeURIComponent("Hi! I'm reaching out from your social media page. I'd love to make an inquiry.")

export const Route = createFileRoute('/whatsapp')({
    beforeLoad: ({ context }) => {
        console.log(context.config)
        // Construct the official WhatsApp click-to-chat URL
        const whatsappUrl = `https://wa.me/${context.config?.whatsapp}?text=${DEFAULT_MESSAGE}`

        if (typeof window !== 'undefined') {
            window.location.href = whatsappUrl
        }

        // Throw a redirect to stop TanStack Router from rendering the component
        throw redirect({
            href: whatsappUrl,
        })
    },
    component: () => null,
})