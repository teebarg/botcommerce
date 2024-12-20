import repeat from "@lib/util/repeat";
import SkeletonCodeForm from "@modules/skeletons/components/skeleton-code-form";
import SkeletonOrderSummary from "@modules/skeletons/components/skeleton-order-summary";

export default function Loading() {
    return (
        <div className="py-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_360px] gap-x-40">
                    <div className="flex flex-col bg-content2 p-6 gap-y-6">
                        <div className="bg-default-100 flex items-start justify-between">
                            <div className="flex flex-col gap-y-2">
                                <div className="w-60 h-8 bg-default-500 animate-pulse" />
                                <div className="w-48 h-6 bg-default-500 animate-pulse" />
                            </div>
                            <div>
                                <div className="w-14 h-8 bg-default-500 animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <div className="pb-3 flex items-center">
                                <div className="w-20 h-12 bg-default-500 animate-pulse" />
                            </div>
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-content3">
                                <thead>
                                    <tr>
                                        {[" ", " ", " ", " ", " "].map((column: string, index: number) => (
                                            <th key={index} className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-default-500" scope="col">
                                                {column}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-content1">
                                    {repeat(3).map((_, index: number) => (
                                        <tr key={index} className="even:bg-content2">
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-800 sm:pl-3">
                                                <div className="flex w-24 h-24 p-4 bg-default-500 rounded-large animate-pulse" />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <div className="flex flex-col gap-y-2">
                                                    <div className="w-32 h-4 bg-default-500 animate-pulse" />
                                                    <div className="w-24 h-4 bg-default-500 animate-pulse" />
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <div className="flex flex-col gap-y-2">
                                                    <div className="w-32 h-4 bg-default-500 animate-pulse" />
                                                    <div className="w-24 h-4 bg-default-500 animate-pulse" />
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <div className="flex gap-2">
                                                    <div className="w-12 h-6 bg-default-500 animate-pulse" />
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <div className="flex gap-2 justify-end">
                                                    <div className="w-12 h-6 bg-default-500 animate-pulse" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-8">
                        <SkeletonOrderSummary />
                        <SkeletonCodeForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
