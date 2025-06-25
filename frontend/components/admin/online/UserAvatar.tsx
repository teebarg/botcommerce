import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OnlineUser {
    id: string;
    name: string;
    avatar?: string;
    isLoggedIn: boolean;
    lastActivity: Date;
    currentPage: string;
    location?: string;
}

interface UserAvatarProps {
    user: OnlineUser;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getAvatarColor = (name: string) => {
        const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-yellow-500", "bg-indigo-500"];
        const index = name.length % colors.length;

        return colors[index];
    };

    return (
        <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarImage alt={user.name} src={user.avatar} />
                <AvatarFallback className={`text-white font-semibold text-sm ${user.isLoggedIn ? getAvatarColor(user.name) : "bg-gray-400"}`}>
                    {user.isLoggedIn ? getInitials(user.name) : "?"}
                </AvatarFallback>
            </Avatar>

            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-400 animate-pulse" />

            {/* User type indicator */}
            {user.isLoggedIn && (
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
            )}
        </div>
    );
};

export default UserAvatar;
