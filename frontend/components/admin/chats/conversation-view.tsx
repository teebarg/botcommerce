"use client";

import { ChatMessageComponent } from "./chat-message";

import { ChatMessage } from "@/types/models";
import { useConversationMessages } from "@/lib/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TextSkeleton } from "@/components/ui/skeletons";
import { Button } from "@/components/ui/button";
import NotFoundUI from "@/components/generic/not-found";

interface ConversationViewProps {
    uid: string;
}

const ConversationView: React.FC<ConversationViewProps> = ({ uid }) => {
    const { data: messages, isLoading } = useConversationMessages(uid);

    if (isLoading) {
        return (
            <div className="h-full px-20 py-12">
                <TextSkeleton lines={20} />
            </div>
        );
    }

    if (!messages) {
        return <NotFoundUI className="h-full" scenario="data" />;
    }

    return (
        <div className="h-full">
            <div className="mb-2 flex justify-end px-4">
                <Button className="min-w-32" variant="default" onClick={() => window.history.back()}>
                    Go Back
                </Button>
            </div>
            <Card className="shadow-lg border-input w-full max-w-2xl mx-auto bg-content1 overflow-auto">
                <CardHeader className="border-b border-input bg-indigo-600 text-white">
                    <CardTitle className="text-xl flex items-center gap-2">AI Assistant</CardTitle>
                    <CardDescription className="text-gray-100">How can we help with your software development needs?</CardDescription>
                </CardHeader>
                <CardContent className="p-0 md:px-0">
                    <div className="flex flex-col h-[600px]">
                        <div className="flex-1 overflow-y-auto py-4 px-1 md:px-4">
                            {messages?.map((msg: ChatMessage, idx: number) => <ChatMessageComponent key={idx} message={msg} />)}
                            {messages?.length === 0 && <div className="text-center">No messages</div>}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ConversationView;
