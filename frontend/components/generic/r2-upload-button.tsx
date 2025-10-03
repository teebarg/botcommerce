"use client";

import React, { useRef, useState } from "react";
import { AlertCircle, CircleCheck, Trash2, Upload, Image as ImageIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadedFile {
    file: File;
    url?: string;
    progress: number;
    status: "uploading" | "success" | "error";
    path?: string;
}

export default function R2Uploader({
    isUploading = false,
    onComplete,
    onClose,
}: {
    isUploading?: boolean;
    onComplete: (urls: string[]) => void;
    onClose: () => void;
}) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isDragOver, setIsDragOver] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        handleUpload(e.dataTransfer.files);
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    async function handleUpload(selectedFiles: FileList | null) {
        if (!selectedFiles) return;

        const newFiles = Array.from(selectedFiles).map((file) => ({
            file,
            progress: 0,
            status: "uploading" as const,
        }));

        setFiles((prev) => [...prev, ...newFiles]);

        await Promise.allSettled(
            newFiles.map(async (item: UploadedFile) => {
                try {
                    const res = await fetch(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/r2/signed-url?filename=${encodeURIComponent(item.file.name)}&content_type=${encodeURIComponent(item.file.type)}`,
                        { method: "POST" }
                    );

                    if (!res.ok) throw new Error("Failed to get signed URL");
                    const { signedUrl, publicUrl, path } = await res.json();

                    // 2. Upload to R2 with progress
                    await new Promise<void>((resolve, reject) => {
                        const xhr = new XMLHttpRequest();

                        xhr.open("PUT", signedUrl, true);
                        xhr.setRequestHeader("Content-Type", item.file.type);

                        xhr.upload.onprogress = (e) => {
                            if (e.lengthComputable) {
                                item.progress = Math.round((e.loaded / e.total) * 100);
                                setFiles((prev) => [...prev]);
                            }
                        };

                        xhr.onload = () => {
                            if (xhr.status === 200) {
                                item.url = publicUrl;
                                item.status = "success";
                                item.path = path;
                                resolve();
                            } else {
                                item.status = "error";
                                reject(new Error("Upload failed"));
                            }
                            setFiles((prev) => [...prev]);
                        };

                        xhr.onerror = () => {
                            item.status = "error";
                            setFiles((prev) => [...prev]);
                            reject(new Error("Network error"));
                        };

                        xhr.send(item.file);
                    });
                } catch (err) {
                    item.status = "error";
                    setFiles((prev) => [...prev]);
                }
            })
        );
    }

    async function handleDelete(file: UploadedFile) {
        if (!file.path) return;

        await fetch(`/api/r2/delete?path=${encodeURIComponent(file.path)}`, {
            method: "DELETE",
        });
        setFiles((prev) => prev.filter((f) => f !== file));
    }

    async function handleDone() {
        onComplete(files.filter((f) => f.url).map((f) => f.url!));
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 bottom-0">
            <div className="rounded-lg shadow-lg w-full md:max-w-2xl h-[100vh] md:h-[75vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center border-b px-4 py-4 bg-secondary">
                    <h2 className="font-semibold">Upload Queue</h2>
                    <button onClick={onClose}>✕</button>
                </div>

                {/* Upload Zone */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className={cn("", files.length > 0 ? "hidden" : "")}>
                        <Card
                            className={cn(
                                "border-2 border-dashed border-indigo-500 transition-all duration-smooth cursor-pointer hover:border-indigo-400",
                                isDragOver ? "border-primary bg-accent/50 scale-[1.02]" : ""
                            )}
                            onClick={openFileDialog}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <div className="px-8 py-4 text-center">
                                <div className="flex justify-center mb-4">
                                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                                        <Upload className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-medium text-card-foreground">Drop your images here</h3>
                                <p className="text-muted-foreground mb-4">or click to browse your files</p>
                                <Button className="pointer-events-none" size="sm" variant="outline">
                                    <ImageIcon className="w-4 h-4 mr-2" />
                                    Choose Images
                                </Button>
                                <p className="text-xs text-muted-foreground mt-2">Supports JPG, PNG, WebP up to 5MB each</p>
                            </div>
                        </Card>
                        <input
                            ref={fileInputRef}
                            hidden
                            multiple
                            accept="image/*"
                            id="fileInput"
                            type="file"
                            onChange={(e) => handleUpload(e.target.files)}
                        />
                    </div>

                    {/* Preview Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {files.map((file, i) => (
                            <div key={i} className="relative border rounded-lg overflow-hidden">
                                <img alt={file.file.name} className="w-full h-48 object-cover" src={file.url || URL.createObjectURL(file.file)} />

                                {file.status === "uploading" && (
                                    <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gray-200">
                                        <div className="h-1.5 bg-blue-500" style={{ width: `${file.progress}%` }} />
                                    </div>
                                )}

                                {file.status === "success" && <CircleCheck className="h-6 w-6 text-green-500 absolute top-2 right-2" />}

                                {file.status === "error" && <AlertCircle className="h-4 w-4 text-destructive absolute top-1 right-1" />}

                                {file.status === "success" && (
                                    <Button
                                        className="absolute bottom-1 right-1"
                                        size="iconOnly"
                                        variant="destructive"
                                        onClick={() => handleDelete(file)}
                                    >
                                        <Trash2 className="h-6 w-6 text-destructive" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t px-4 py-4 flex justify-between bg-secondary">
                    <Button variant="indigo" onClick={() => document.getElementById("fileInput")?.click()}>
                        Upload more
                    </Button>
                    <Button disabled={isUploading} isLoading={isUploading} variant="emerald" onClick={handleDone}>
                        Done
                    </Button>
                </div>
            </div>
        </div>
    );
}
