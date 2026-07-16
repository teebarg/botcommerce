import { SearchX, type LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

export default function EmptyState({ icon: Icon = SearchX, title, description, action, children, className }: EmptyStateProps) {
    return (
        <div className={cn("text-center py-12 px-4", className)}>
            {Icon && (
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center">
                    <Icon className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
                </div>
            )}
            <h3 className="text-base font-semibold mb-1.5">{title}</h3>
            {description && (
                <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed mb-5">{description}</p>
            )}
            {action}
            {children}
        </div>
    );
}