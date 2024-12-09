import { useCallback } from "react";
import { debounce } from "@lib/util/util";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface QueryParam {
    key: string;
    value: string;
}

const useUpdateQuery = (delay = 500) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

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
            router.push(`${pathname}?${params.toString()}`);
        }, delay),
        [searchParams]
    );

    return { updateQuery };
};

export { useUpdateQuery };
