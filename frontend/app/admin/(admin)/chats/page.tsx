import { Metadata } from "next";
import React from "react";

import ClientOnly from "@/components/generic/client-only";
import ChatsView from "@/components/admin/chats/chats-view";

export const metadata: Metadata = {
    title: "Chats",
};

export default async function ChatsPage() {
    return (
        <ClientOnly>
            <ChatsView />
        </ClientOnly>
    );
}
