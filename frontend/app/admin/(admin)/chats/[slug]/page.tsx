import React from "react";

import ClientOnly from "@/components/generic/client-only";
import ConversationView from "@/components/admin/chats/conversation-view";

type Params = Promise<{ slug: string }>;

export default async function ConversationPage({ params }: { params: Params }) {
    const { slug } = await params;

    return (
        <ClientOnly>
            <ConversationView uid={slug} />
        </ClientOnly>
    );
}
