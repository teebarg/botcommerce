"use client";

import { useEffect, useState } from "react";
import { api } from "@/apis/client";
import { tryCatch } from "@/lib/try-catch";

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

            const { data } = await tryCatch<VisitTrackerResponse>(api.post(`/shared/${slug}/track-visit`));
            if (data) {
                setHasTracked(true);
            }
        };

        trackVisit();
    }, [slug, hasTracked]);

    return null;
}
