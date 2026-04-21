import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface OnlineAvatarProps {
    email?: string;
}

const OnlineAvatar: React.FC<OnlineAvatarProps> = ({ email }) => {
    return (
        <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-accent shadow-sm">
                <AvatarFallback className={`text-white font-semibold text-sm ${email !== "Unknown" ? "bg-purple-500" : "bg-gray-400"}`}>
                    {email !== "Unknown" ? "U" : "G"}
                </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-400 animate-pulse" />
        </div>
    );
};

export default OnlineAvatar;
