"use client";

import React, { useState } from "react";
import { EditIcon } from "nui-react-icons";
import { DragNDrop } from "@modules/admin/components/drag-drop";
import { FileTypes } from "types/global";
import { useSnackbar } from "notistack";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface Props {
    onUpload: (formData: any) => void;
    wsUrl?: string;
    revalidateKey?: string;
    defaultImage?: string;
}

const ImageUpload: React.FC<Props> = ({ onUpload, defaultImage = "" }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [file, setFile] = useState<File>();
    const [preview, setPreview] = useState<any>(defaultImage);
    const [status, setStatus] = useState<boolean>(false);
    const [isDirty, setDirty] = useState<boolean>(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!file) {
            enqueueSnackbar("Please select a file", { variant: "error" });

            return;
        }
        setStatus(true);
        const formData = new FormData();

        formData.append("file", file);

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

        // Preview the image
        // eslint-disable-next-line no-undef
        if (files[0]) {
            const reader = new FileReader();

            reader.onloadend = () => {
                setPreview(reader?.result);
                setDirty(true);
            };
            reader.readAsDataURL(files[0]);
        } else {
            setPreview(undefined);
        }
    };

    return (
        <React.Fragment>
            <div className="w-full">
                {preview && (
                    <React.Fragment>
                        <div className="flex gap-1">
                            <div className="h-72 w-80 rounded-lg overflow-hidden relative">
                                <Image fill alt="Product" src={preview} />
                            </div>
                            <Button onClick={() => setPreview(undefined)}>
                                <EditIcon size={24} />
                            </Button>
                        </div>
                    </React.Fragment>
                )}
                {!preview && (
                    <DragNDrop
                        acceptedFiles={[FileTypes.jpeg, FileTypes.jpg, FileTypes.png, FileTypes.avif]}
                        allowsMultiple={false}
                        onError={(message: string) => enqueueSnackbar(message, { variant: "error" })}
                        onSelect={OnSelect}
                    />
                )}
                {preview && isDirty && (
                    <Button className="min-w-24 mt-2" color="secondary" disabled={status} isLoading={status} variant="shadow" onClick={handleSubmit}>
                        Upload{status ? "ing" : ""}
                    </Button>
                )}
            </div>
        </React.Fragment>
    );
};

export { ImageUpload };
