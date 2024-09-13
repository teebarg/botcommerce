"use client";

import React, { useEffect, useState } from "react";
import { Progress } from "@nextui-org/react";
import { useSnackbar } from "notistack";
import { useWebSocket } from "@lib/hooks/use-websocket";
import { DragNDrop } from "./drag-drop";
import Button from "@modules/common/components/button";

interface Props {
    onUpload: (id: string, formData: any) => void;
    wsUrl: string;
}

const Excel: React.FC<Props> = ({ onUpload, wsUrl }) => {
    const id = "nK12eRTbo";
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
        return currentMessage?.status == "Processing" ? "Processing" : "Submit";
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
            await onUpload(id, formData);
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
                <DragNDrop onSelect={OnSelect} onError={(message: string) => enqueueSnackbar(message, { variant: "error" })} />
                <Button
                    onClick={() => handleSubmit()}
                    disabled={status || currentMessage?.status == "Processing"}
                    isLoading={status || currentMessage?.status == "Processing"}
                    variant="shadow"
                    color="secondary"
                    className="min-w-48 rounded-md"
                >
                    {currentStatus()}
                </Button>
            </div>
            <div className="mt-8">
                {wsMessages && (
                    <Progress
                        aria-label="Downloading..."
                        size="sm"
                        value={(currentMessage?.processed_rows / currentMessage?.total_rows) * 100 || 0}
                        color="success"
                        label={`progress: ${currentMessage?.processed_rows || 0} / ${currentMessage?.total_rows || 0} rows`}
                        showValueLabel={true}
                        className=""
                    />
                )}
            </div>
        </React.Fragment>
    );
};

export { Excel };
