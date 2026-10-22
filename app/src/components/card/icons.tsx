import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps & { children: ReactNode }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
        >
            {children}
        </svg>
    );
}

export const WhatsAppIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="M3 21l1.65-4.9A8.5 8.5 0 1 1 8 19.4L3 21z" />
        <path d="M8.5 10h7M8.5 13.5h4.5" />
    </Icon>
);

export const TelegramIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="M21 4L3 11l6 2.5L11.5 20l3-4.5L19 19 21 4z" />
        <path d="M9 13.5L21 4" />
    </Icon>
);

export const BagIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="M5 8h14l-1 12H6L5 8z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </Icon>
);

export const TikTokIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
        <path d="M14 3c.4 2.4 2 4 4.5 4.2" />
    </Icon>
);

export const InstagramIcon = (p: IconProps) => (
    <Icon {...p}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </Icon>
);

export const FacebookIcon = (p: IconProps) => (
    <Icon {...p}>
        <path d="M14.5 21v-7.5h2.5l.5-3h-3V8.8c0-.9.3-1.5 1.6-1.5h1.6V4.6c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.2H9.5v3h2.3V21" />
    </Icon>
);

export const MailIcon = (p: IconProps) => (
    <Icon {...p}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
    </Icon>
);

export const ArrowIcon = (p: IconProps) => (
    <Icon strokeWidth={2.2} {...p}>
        <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
);

export const ChevronIcon = (p: IconProps) => (
    <Icon strokeWidth={2} {...p}>
        <path d="M9 6l6 6-6 6" />
    </Icon>
);
