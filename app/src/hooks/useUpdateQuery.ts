import { useCallback } from "react";
import { debounce } from "@/utils";
import { useLocation, useNavigate } from "@tanstack/react-router";

interface QueryParam {
    key: string;
    value: string;
}

const useUpdateQuery = (delay = 500) => {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const updateQuery = useCallback(
        debounce((data: QueryParam[]) => {
            navigate({
                to: pathname,
                search: (prev) => {
                    const params = new URLSearchParams(
                        prev as Record<string, string>
                    );
                    data.forEach(({ key, value }) => {
                        value ? params.set(key, value) : params.delete(key);
                    });
                    return Object.fromEntries(params);
                },
            });
        }, delay),
        [pathname, delay]
    );

    return { updateQuery };
};

export { useUpdateQuery };
