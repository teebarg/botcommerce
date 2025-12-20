const MaintenanceIllustration = () => {
    return (
        <div className="relative w-64 h-64 md:w-80 md:h-80">
            <svg
                className="absolute top-4 left-4 w-32 h-32 text-contrast/60 animate-spin"
                style={{ animationDuration: "8s" }}
                viewBox="0 0 100 100"
                fill="currentColor"
            >
                <path d="M50 10 L55 25 L70 20 L65 35 L80 40 L65 50 L80 60 L65 65 L70 80 L55 75 L50 90 L45 75 L30 80 L35 65 L20 60 L35 50 L20 40 L35 35 L30 20 L45 25 Z" />
                <circle cx="50" cy="50" r="15" className="fill-background" />
            </svg>
            <svg
                className="absolute bottom-8 right-4 w-24 h-24 text-primary/60 animate-spin"
                style={{ animationDuration: "6s", animationDirection: "reverse" }}
                viewBox="0 0 100 100"
                fill="currentColor"
            >
                <path d="M50 15 L54 28 L67 24 L63 37 L76 42 L63 50 L76 58 L63 63 L67 76 L54 72 L50 85 L46 72 L33 76 L37 63 L24 58 L37 50 L24 42 L37 37 L33 24 L46 28 Z" />
                <circle cx="50" cy="50" r="12" className="fill-background" />
            </svg>
            <svg
                className="absolute top-1/2 right-8 w-16 h-16 text-muted-foreground/40 animate-spin"
                style={{ animationDuration: "5s" }}
                viewBox="0 0 100 100"
                fill="currentColor"
            >
                <path d="M50 20 L53 32 L65 29 L62 41 L74 45 L62 50 L74 55 L62 59 L65 71 L53 68 L50 80 L47 68 L35 71 L38 59 L26 55 L38 50 L26 45 L38 41 L35 29 L47 32 Z" />
                <circle cx="50" cy="50" r="10" className="fill-background" />
            </svg>
            <svg
                className="absolute bottom-4 left-16 w-20 h-20 text-primary/80 animate-float"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            <div className="absolute top-0 right-0 w-3 h-3 bg-accent rounded-full animate-pulse" />
            <div className="absolute bottom-16 left-0 w-2 h-2 bg-accent/60 rounded-full animate-pulse-slow" style={{ animationDelay: "1s" }} />
            <div className="absolute top-20 right-16 w-2 h-2 bg-primary/40 rounded-full animate-pulse-slow" style={{ animationDelay: "2s" }} />
        </div>
    );
};

export default MaintenanceIllustration;
