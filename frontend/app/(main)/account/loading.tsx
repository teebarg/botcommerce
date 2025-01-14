import { Spinner } from "@/modules/common/components/spinner";

export default function Loading() {
    return (
        <div className="flex items-center justify-center w-full h-full text-default-900 mt-2">
            <Spinner />
        </div>
    );
}
