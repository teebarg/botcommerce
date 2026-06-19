import { Link } from "@tanstack/react-router";
import { cn } from "@/utils";

interface Props {
    title: string;
    subtitle?: string;
    href?: string;
    className?: string;
}

export default function PromotionalBanner({ title, subtitle, href = "/collections", className }: Props) {
    return (
        <div className={cn("mx-4 my-3 rounded-2xl bg-secondary px-5 py-4 flex items-center justify-between", className)}>
            <div>
                <p className="font-semibold text-foreground text-sm">{title}</p>
                {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
            <Link
                to={href}
                className="shrink-0 bg-foreground text-background text-xs font-semibold px-4 py-2 rounded-full"
            >
                Shop
            </Link>
        </div>
    );
}