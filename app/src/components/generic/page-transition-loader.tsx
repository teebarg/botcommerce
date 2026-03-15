import { useRouterState } from "@tanstack/react-router";

function PageTransitionLoader() {
    const isLoading = useRouterState({
        select: (s) => s.isLoading,
    });

    if (!isLoading) return null;

    return (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-transparent overflow-hidden z-70">
            <div className="h-full bg-gradient-action animate-progress-bar" />
        </div>
    );
}

export default PageTransitionLoader;