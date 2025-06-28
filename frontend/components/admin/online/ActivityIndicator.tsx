const ActivityIndicator: React.FC = () => {
    return (
        <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse delay-100" />
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse delay-200" />
        </div>
    );
};

export default ActivityIndicator;
