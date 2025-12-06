import { FileImage } from "lucide-react";

export const ZeroState = ({ title, description, icon }: { title: string; description: string; icon?: React.ReactNode }) => {
    return (
        <div className="bg-card rounded-2xl p-12 text-center border-2 border-dashed border-input">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {icon || <FileImage className="w-8 h-8 text-gray-400" />}
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
        </div>
    );
};
