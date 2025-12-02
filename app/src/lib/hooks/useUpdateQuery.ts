import { startTransition, useCallback } from "react";
import { debounce } from "@/lib/utils";

import { useProgressBar } from "@/components/ui/progress-bar";
import { useLocation, useNavigate } from "@tanstack/react-router";

interface QueryParam {
    key: string;
    value: string;
}

const useUpdateQuery = (delay = 500) => {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;
    const searchParams: any = null;
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
                navigate({ to: `${pathname}?${params.toString()}` });
                progress.done();
            });
        }, delay),
        [searchParams]
    );

    return { updateQuery };
};

export { useUpdateQuery };
