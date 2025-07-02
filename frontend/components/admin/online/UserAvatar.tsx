import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface OnlineUser {
    id: string;
    name: string;
    email?: string;
    last_seen: number;
    path: string;
    location?: string;
}

interface UserAvatarProps {
    user: OnlineUser;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
    return (
        <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarFallback className={`text-white font-semibold text-sm ${user.email !== "Unknown" ? "bg-purple-500" : "bg-gray-400"}`}>
                    {user.email !== "Unknown" ? "US" : "G"}
                </AvatarFallback>
            </Avatar>

            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-400 animate-pulse" />

            {/* User type indicator */}
            {user.email !== "Unknown" && (
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
            )}
        </div>
    );
};

export default UserAvatar;
