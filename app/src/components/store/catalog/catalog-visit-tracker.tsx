import { useEffect, useState } from "react";
import { tryCatch } from "@/utils/try-catch";
import { clientApi } from "@/utils/api.client";

interface CatalogVisitTrackerProps {
    slug: string;
}

interface VisitTrackerResponse {
    success: boolean;
    is_new_visit: boolean;
    view_count: number;
}

export function CatalogVisitTracker({ slug }: CatalogVisitTrackerProps) {
    const [hasTracked, setHasTracked] = useState<boolean>(false);

    useEffect(() => {
        const trackVisit = async () => {
            if (hasTracked) return;

            const { data } = await tryCatch<VisitTrackerResponse>(clientApi.post<VisitTrackerResponse>(`/catalog/${slug}/track-visit`));

            if (data) {
                setHasTracked(true);
            }
        };

        trackVisit();
    }, [slug, hasTracked]);

    return null;
}
