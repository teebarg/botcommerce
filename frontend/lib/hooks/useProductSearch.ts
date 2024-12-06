import { useEffect, useState } from "react";
import { SearchParams } from "types/global";

const useProductSearch = (params: SearchParams) => {
    const [results, setResults] = useState(null);

    useEffect(() => {
        const fetchSearchResults = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/search`, {
                method: "POST",
                headers: {
                    accept: "application/json",
                },
                body: JSON.stringify(params),
            });
            const data = await response.json();

            setResults(data);
        };

        fetchSearchResults();
    }, [params]);

    return results;
};

export { useProductSearch };
