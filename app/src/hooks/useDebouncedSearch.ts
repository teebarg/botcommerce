import { useEffect, useState } from "react";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";

export function useDebouncedSearch(paramKey: string, currentValue: string | undefined, delay = 500) {
    const { updateQuery } = useUpdateQuery(delay);
    const [value, setValue] = useState(currentValue ?? "");

    useEffect(() => {
        setValue(currentValue ?? "");
    }, [currentValue]);

    function onChange(next: string) {
        setValue(next);
        updateQuery([{ key: paramKey, value: next }]);
    }

    return { value, onChange };
}