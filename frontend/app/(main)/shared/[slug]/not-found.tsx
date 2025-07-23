import { BtnLink } from "@/components/ui/btnLink";

export default function SharedCollectionNotFound() {
    return (
        <div className="max-w-xl m-auto p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Collection Not Found</h1>
            <p className="text-default-600 mb-4">This collection does not exist or is no longer available.</p>
            <BtnLink href="/" variant="primary">
                Go back home
            </BtnLink>
        </div>
    );
}
