import type { ComponentType, ReactNode, SVGProps } from "react";
import { ArrowIcon, ChevronIcon } from "@/components/card/icons";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

const brandStyles = {
    whatsapp: "bg-[#25d366] text-neutral-950",
    telegram: "bg-[#2aabee] text-neutral-950",
} as const;

export function ActionLink({
    href,
    brand,
    icon: Icon,
    title,
    hint,
}: {
    href: string;
    brand: keyof typeof brandStyles;
    icon: IconType;
    title: string;
    hint: string;
}) {
    return (
        <a
            href={href}
            className={`flex min-h-18 items-center gap-3.5 rounded-2xl px-4.5 py-2 transition-transform active:scale-[0.985] ${focusRing} ${brandStyles[brand]}`}
            target="_blank"
        >
            <Icon className="size-7 flex-none" strokeWidth={2} />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-display text-[19px] leading-[1.15] font-bold">{title}</span>
                <span className="text-[13px] font-medium text-neutral-900">{hint}</span>
            </span>
            <ArrowIcon className="size-5.5 flex-none" />
        </a>
    );
}

export function GhostLink({ href, icon: Icon, children }: { href: string; icon: IconType; children: ReactNode }) {
    return (
        <a
            href={href}
            className={`flex min-h-13 items-center gap-3 rounded-[18px] border border-line-strong px-[18px] transition-transform active:scale-[0.985] ${focusRing}`}
            target="_blank"
        >
            <Icon className="size-[22px] flex-none" />
            <span className="flex-1 text-base font-semibold">{children}</span>
            <ChevronIcon className="size-5 flex-none text-muted-foreground" />
        </a>
    );
}

/** One row in the "follow" list: icon, label, handle. */
export function SocialRow({ href, icon: Icon, label, handle }: { href: string; icon: IconType; label: string; handle: string }) {
    return (
        <a
            href={href}
            className={`flex min-h-15 items-center gap-3.5 px-4 transition-colors active:bg-line/60 ${focusRing} focus-visible:ring-inset focus-visible:ring-offset-0`}
            target="_blank"
        >
            <Icon className="size-[22px] flex-none" />
            <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[15px] font-semibold">{label}</span>
                <span className="truncate text-[13px] text-muted-foreground">{handle}</span>
            </span>
            <ChevronIcon className="size-[18px] flex-none text-muted" />
        </a>
    );
}
