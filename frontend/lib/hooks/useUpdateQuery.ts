import { startTransition, useCallback } from "react";
import { debounce } from "@lib/util/util";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useProgressBar } from "@/components/ui/progress-bar";

interface QueryParam {
    key: string;
    value: string;
}

const useUpdateQuery = (delay = 500) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    let progress = useProgressBar();

    const updateQuery = useCallback(
        debounce((data: QueryParam[]) => {
            const params = new URLSearchParams(searchParams);

            data.forEach(({ key, value }) => {
                if (!value || value === "") {
                    params.delete(key);

                    return;
                }
                params.set(key, value);
            });
            progress.start();

            startTransition(() => {
                router.push(`${pathname}?${params.toString()}`);
                progress.done();
            });
        }, delay),
        [searchParams]
    );

    return { updateQuery };
};

export { useUpdateQuery };
