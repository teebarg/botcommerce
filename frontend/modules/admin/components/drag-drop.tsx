"use client";

import type { FileDropItem } from "@react-aria/dnd";

import { DropZone } from "react-aria-components";
import React from "react";
import { CancelIcon, UploadIcon } from "nui-react-icons";
import { FileTrigger } from "@modules/common/components/file-trigger";
import useWatch from "@lib/hooks/use-watch";
import { FileTypes } from "types/global";

interface DragNDropProps {
    onSelect: (files: File[]) => void;
    onError?: (message: string) => void;
    maxFileSize?: number;
    allowsMultiple?: boolean;
    acceptedFiles?: FileTypes[];
}

const DragNDrop: React.FC<DragNDropProps> = ({ onSelect, onError, maxFileSize = 1500, allowsMultiple = true, acceptedFiles = [FileTypes.xlsx] }) => {
    const [files, setFiles] = React.useState<File[]>([]);

    useWatch(files, (newValue: File[]) => {
        onSelect(newValue);
    });

    const handleSelectedFiles = (files: File[]) => {
        const newFiles = files.filter((file: File) => {
            // Check file size (in kilobytes)
            if (file.size > maxFileSize * 1024) {
                onError?.(`File ${file.name} size exceeds ${maxFileSize} KB`);

                return;
            } else {
                return true;
            }
        });

        setFiles(newFiles);
    };

    const handleCancel = () => {
        setFiles([]);
    };

    // const acceptedFiles = [FileTypes.xlsx, FileTypes.png];

    return (
        <DropZone
            className="min-w-96 max-w-md bg-content2 p-4 rounded-md shadow-md relative border-dashed border-2 border-sky-500 min-h-[10rem] flex flex-col place-content-center place-items-center"
            onDrop={async (e) => {
                const files: any = e.items.filter((file: any) => file.kind === "file" && acceptedFiles.includes(file.type)) as FileDropItem[];
                const selectedFiles: File[] = [];

                await files.forEach(async (item: FileDropItem) => {
                    const file = await item.getFile();

                    selectedFiles.push(file);
                });
                handleSelectedFiles(selectedFiles);
            }}
        >
            {files[0] && (
                <button aria-label="cancel" className="absolute top-3 right-4" type="button" onClick={handleCancel}>
                    <CancelIcon aria-hidden="true" size={24} />
                </button>
            )}
            <FileTrigger
                acceptedFileTypes={acceptedFiles}
                allowsMultiple={allowsMultiple}
                onSelect={(e: FileList | null) => {
                    const files = Array.from(e ?? []);

                    handleSelectedFiles(files);
                }}
            >
                <div className="text-center space-y-2">
                    <UploadIcon className="h-16 w-16 inline" fill="#007bff" />
                    <p>
                        Drop your files here or{" "}
                        <button aria-label="browse" className="link">
                            browse.
                        </button>
                    </p>
                    <button aria-label="select" className="btn-custom group min-w-48 bg-primary text-primary-foreground" type="button">
                        Select
                    </button>
                </div>
            </FileTrigger>
            <div className="mt-4" slot="label">
                {files?.map((file: File, index: number) => (
                    <span key={index} className="block">
                        {file.name}
                    </span>
                ))}
            </div>
        </DropZone>
    );
};

export { DragNDrop };
