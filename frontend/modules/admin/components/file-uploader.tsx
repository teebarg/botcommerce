"use client";

import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useWebSocket } from "@lib/hooks/use-websocket";

import { DragNDrop } from "./drag-drop";

import { Button } from "@/components/ui/button";
import Progress from "@/components/ui/progress";

interface Props {
    onUpload: (formData: FormData) => void;
    wsUrl: string;
}

const Excel: React.FC<Props> = ({ onUpload, wsUrl }) => {
    const { enqueueSnackbar } = useSnackbar();

    const [file, setFile] = useState<File>();
    const [status, setStatus] = useState<boolean>(false);
    const { messages: wsMessages, connect: initializeWebsocket, disconnect: disconnectWebsocket } = useWebSocket({ type: ["sheet-processor"] });

    const currentMessage = wsMessages[wsMessages.length - 1];

    useEffect(() => {
        initializeWebsocket(wsUrl);

        return () => {
            disconnectWebsocket();
        };
    }, []);

    const currentStatus = () => {
        if (status) {
            return "Submitting";
        }

        return currentMessage?.status == "processing" ? "Processing" : "Submit";
    };

    const handleSubmit = async () => {
        // e.preventDefault();
        if (!file) {
            enqueueSnackbar("Please select a file", { variant: "error" });

            return;
        }
        setStatus(true);
        const formData = new FormData();

        formData.append("file", file);
        formData.append("batch", "batch1");

        try {
            await onUpload(formData);
        } catch (error) {
            enqueueSnackbar(`Error uploading file: ${error}`, { variant: "error" });
        } finally {
            setStatus(false);
        }
    };

    const OnSelect = (files: File[]) => {
        setFile(files ? files[0] : undefined);
    };

    return (
        <React.Fragment>
            <div className="flex gap-2">
                <DragNDrop onError={(message: string) => enqueueSnackbar(message, { variant: "error" })} onSelect={OnSelect} />
                <Button
                    className="min-w-48 rounded-md"
                    color="secondary"
                    disabled={status || currentMessage?.status == "processing"}
                    isLoading={status || currentMessage?.status == "processing"}
                    variant="outline"
                    onClick={() => handleSubmit()}
                >
                    {currentStatus()}
                </Button>
            </div>
            <div className="mt-8">
                {wsMessages && (
                    <Progress
                        aria-label="Downloading..."
                        // label={`progress: ${currentMessage?.processed_rows || 0} / ${currentMessage?.total_rows || 0} rows`}
                        value={(currentMessage?.processed_rows / currentMessage?.total_rows) * 100 || 0}
                    />
                )}
            </div>
        </React.Fragment>
    );
};

export { Excel };
