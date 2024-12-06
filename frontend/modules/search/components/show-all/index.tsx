import { useHits, useSearchBox } from "react-instantsearch-hooks-web";
import InteractiveLink from "@modules/common/components/interactive-link";

const ShowAll = () => {
    const { hits } = useHits();
    const { query } = useSearchBox();
    const width = typeof window !== "undefined" ? window.innerWidth : 0;

    if (query === "") return null;
    if (hits.length > 0 && hits.length <= 6) return null;

    if (hits.length === 0) {
        return (
            <div className="flex gap-2 justify-center h-fit py-2 shadow-md" data-testid="no-search-results-container">
                <p>No results found.</p>
            </div>
        );
    }

    return (
        <div className="flex sm:flex-col gap-2 justify-center items-center h-fit py-4 sm:py-2 shadow-md">
            <p>Showing the first {width > 640 ? 6 : 3} results.</p>
            <InteractiveLink href={`/search/${query}`}>View all</InteractiveLink>
        </div>
    );
};

export default ShowAll;
