import { useRouterState } from "@tanstack/react-router";

function PageTransitionLoader() {
    const isLoading = useRouterState({
        select: (s) => s.isLoading,
    });

    if (!isLoading) return null;

    return <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-action animate-pulse z-70" />;
}


export default PageTransitionLoader