import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_mainLayoutPublic/_static/contact-us')({
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
})
