import { useEffect, useState } from "react";
import { tryCatch } from "@/utils/try-catch";
import { trackVisitFn } from "@/server/catalog.server";

interface SharedCollectionVisitTrackerProps {
    slug: string;
}

interface VisitTrackerResponse {
    success: boolean;
    is_new_visit: boolean;
    view_count: number;
}

export function SharedCollectionVisitTracker({ slug }: SharedCollectionVisitTrackerProps) {
    const [hasTracked, setHasTracked] = useState<boolean>(false);

    useEffect(() => {
        const trackVisit = async () => {
            if (hasTracked) return;

            const { data } = await tryCatch<VisitTrackerResponse>(trackVisitFn({ data: slug }));

            if (data) {
                setHasTracked(true);
            }
        };

        trackVisit();
    }, [slug, hasTracked]);

    return null;
}
