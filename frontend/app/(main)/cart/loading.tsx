import ComponentLoader from "@/components/component-loader";

export default function Loading() {
    return (
        <div className="py-6 md:py-12">
            <div className="max-w-7xl mx-auto px-2 md:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_360px] gap-x-20">
                    <div className="flex flex-col bg-content1 px-2 py-4 md:p-6 gap-y-6">
                        <div className="hidden md:block">
                            <ComponentLoader className="w-20 h-12 mb-8" />
                        </div>
                        <div className="md:hidden">
                            <ComponentLoader className="h-[400px]" />
                        </div>
                    </div>
                    <div className="hidden md:flex flex-col gap-y-8">
                        <ComponentLoader className="h-[400px]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
