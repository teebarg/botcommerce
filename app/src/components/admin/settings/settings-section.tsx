import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface SettingsSectionProps {
    title: string;
    icon?: ReactNode;
    children?: ReactNode;
    onPress?: () => void;
}

const SettingsSection = ({ title, icon, children, onPress }: SettingsSectionProps) => {
    const isClickable = !!onPress;

    return (
        <div
            className={`bg-white rounded-lg border border-gray-200 mb-4 overflow-hidden ${isClickable ? "cursor-pointer hover:border-primary/50" : ""}`}
            onClick={onPress}
        >
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {icon && <div className="mr-3 text-primary">{icon}</div>}
                        <h3 className="font-medium text-gray-900">{title}</h3>
                    </div>
                    {isClickable && <ChevronRight className="text-gray-400" size={20} />}
                </div>
                {children && <div className="mt-3">{children}</div>}
            </div>
        </div>
    );
};

export default SettingsSection;
