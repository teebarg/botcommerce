import { Metadata } from "next";
import InteractiveLink from "@modules/common/components/interactive-link";

export const metadata: Metadata = {
    title: "404",
    description: "Something went wrong",
};

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
            <h1 className="text-2xl text-default-800">Page not found</h1>
            <p className="text-sm text-default-800">The cart you tried to access does not exist. Clear your cookies and try again.</p>
            <InteractiveLink href="/">Go to frontpage</InteractiveLink>
        </div>
    );
}
