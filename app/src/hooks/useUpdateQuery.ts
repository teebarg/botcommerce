import { useCallback } from "react";
import { debounce } from "@/utils";
import { useLocation, useNavigate, useSearch } from "@tanstack/react-router";

interface QueryParam {
    key: string;
    value: string;
}

const useUpdateQuery = (delay = 500) => {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;
    const search = useSearch({
        strict: false,
    }) as Record<string, string>;

    const updateQuery = useCallback(
        debounce((data: QueryParam[]) => {
            const params = new URLSearchParams(search);

            data.forEach(({ key, value }) => {
                if (!value || value === "") {
                    params.delete(key);

                    return;
                }
                params.set(key, value);
            });
            navigate({ to: `${pathname}?${params.toString()}` });
        }, delay),
        [search]
    );

    return { updateQuery };
};

export { useUpdateQuery };
