import { useRouterState } from "@tanstack/react-router";

function PageTransitionLoader() {
    const isLoading = useRouterState({
        select: (s) => s.isLoading,
    });
    console.log(isLoading)

    if (!isLoading) return null;

    return <div className="fixed top-0 left-0 right-0 h-2 bg-red-500 animate-pulse z-50" />;
}


export default PageTransitionLoader