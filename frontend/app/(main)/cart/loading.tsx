import repeat from "@lib/util/repeat";

import { Skeleton } from "@/components/ui/skeletons";

export default function Loading() {
    return (
        <div className="py-6 md:py-12">
            <div className="max-w-7xl mx-auto px-2 md:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_360px] gap-x-20">
                    <div className="flex flex-col bg-content1 px-2 py-4 md:p-6 gap-y-6">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-y-2">
                                <Skeleton className="w-60 h-8" />
                                <Skeleton className="w-48 h-6" />
                            </div>
                            <Skeleton className="w-14 h-8" />
                        </div>
                        <div className="hidden md:block">
                            <Skeleton className="w-20 h-12 mb-8" />
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-content1">
                                <tbody className="bg-content1">
                                    {repeat(4).map((_, index: number) => (
                                        <tr key={index} className="even:bg-content2">
                                            <td className="py-2 pl-4 pr-3">
                                                <Skeleton className="flex w-24 h-24 p-4 rounded-1xl" />
                                            </td>
                                            <td className="px-3">
                                                <div className="flex flex-col gap-y-2">
                                                    <Skeleton className="w-32 h-4" />
                                                    <Skeleton className="w-24 h-4" />
                                                </div>
                                            </td>
                                            <td className="px-3">
                                                <div className="flex flex-col gap-y-2">
                                                    <Skeleton className="w-32 h-4" />
                                                    <Skeleton className="w-24 h-4" />
                                                </div>
                                            </td>
                                            <td className="px-3">
                                                <Skeleton className="w-12 h-6" />
                                            </td>
                                            <td className="px-3">
                                                <div className="flex gap-2 justify-end">
                                                    <Skeleton className="w-12 h-6" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="md:hidden">
                            <div className="py-0">
                                <div className="space-y-4">
                                    {repeat(3).map((_, index: number) => (
                                        <div key={index} className="flex items-center space-x-4 py-4 border-b-slate-300">
                                            <Skeleton className="aspect-square w-28 h-28 rounded-xl" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="w-3/4 h-4" />
                                                <Skeleton className="w-1/4 h-4" />
                                            </div>
                                            <div className="flex flex-col space-y-2">
                                                <Skeleton className="w-20 h-4" />
                                                <Skeleton className="w-12 h-4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:flex flex-col gap-y-8">
                        <div className="grid-cols-1">
                            <div className="flex flex-col">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="w-32 h-3" />
                                    <Skeleton className="w-32 h-3" />
                                </div>

                                <div className="flex items-center justify-between my-4">
                                    <Skeleton className="w-24 h-3" />
                                    <Skeleton className="w-24 h-3" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Skeleton className="w-28 h-3" />
                                    <Skeleton className="w-20 h-3" />
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <Skeleton className="w-32 h-6 mb-4" />
                                    <Skeleton className="w-24 h-6 mb-4" />
                                </div>
                            </div>
                            <Skeleton className="w-full min-h-[50px] py-[10px] mt-4" />
                        </div>
                        <div className="w-full flex flex-col">
                            <Skeleton className="h-7 w-24 mb-4" />
                            <div className="grid grid-cols-[1fr_80px] gap-x-2">
                                <Skeleton className="h-12" />
                                <Skeleton className="h-12" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
