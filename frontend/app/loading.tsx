import React from "react";

// import { Spinner } from "@/components/spinner";
import PageTransition from "@/components/page-transition";

const Loader = () => {
    return <PageTransition />;
    // return (
    //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-700">
    //         <div className="text-center">
    //             {/* Animated Logo Placeholder */}
    //             <div className="mb-8 flex items-center justify-center">
    //                 <div className="w-24 h-24 bg-gradient-to-br from-neutral-300 to-neutral-600 dark:from-neutral-600 dark:to-neutral-400 rounded-full shadow-2xl flex items-center justify-center">
    //                     <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-neutral-700 to-neutral-900 dark:from-neutral-200 dark:to-neutral-100">
    //                         M
    //                     </span>
    //                 </div>
    //             </div>

    //             {/* Loading Text and Spinner */}
    //             <div className="space-y-4">
    //                 <h2 className="text-3xl font-light text-default-900">Loading your experience</h2>

    //                 <Spinner color="current" />

    //                 {/* Subtle Loading Text Animation */}
    //                 <p className="text-default-500">Preparing your personalized experience</p>
    //             </div>
    //         </div>
    //     </div>
    // );
};

export default Loader;
