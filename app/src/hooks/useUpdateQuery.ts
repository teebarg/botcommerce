import { useCallback } from "react";
import { debounce } from "@/utils";
import { useLocation, useNavigate } from "@tanstack/react-router";

interface QueryParam {
    key: string;
    value?: string | number | boolean | null;
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
                        if (value === undefined || value === null || value === "") {
                            params.delete(key);
                        } else {
                            params.set(key, String(value));
                        }
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
