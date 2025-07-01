import { Metadata } from "next";
import React from "react";

import ChatsView from "@/components/admin/chats/chats-view";

export const metadata: Metadata = {
    title: "Chats",
};

export default async function ChatsPage() {
    return <ChatsView />;
}
