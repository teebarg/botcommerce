import { Spinner } from "nui-react-icons";

export default function Loading() {
    return (
        <div className="flex items-center justify-center w-full h-full text-default-900">
            <Spinner size={36} />
        </div>
    );
}
