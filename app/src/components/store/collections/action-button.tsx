import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/utils";

interface ActionButtonProps {
    icon: LucideIcon;
    label?: string;
    count?: number;
    isActive?: boolean;
    onClick?: () => void;
    activeColor?: string;
    activeBackgroundColor?: string;
}

export const ActionButton = ({
    icon: Icon,
    label,
    count,
    isActive = false,
    onClick,
    activeColor = "text-primary",
    activeBackgroundColor = "bg-primary/50",
}: ActionButtonProps) => {
    return (
        <motion.button whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.05 }} onClick={onClick} className="flex flex-col items-center gap-1">
            <div className={cn("action-button", isActive ? activeBackgroundColor : "")}>
                <Icon className={`w-6 h-6 transition-colors ${isActive ? activeColor : "text-white/80"}`} fill={isActive ? "currentColor" : "none"} />
            </div>
            {label && !count && <span className="text-xs font-bold text-destructive">{label}</span>}
        </motion.button>
    );
};
