"use client";

// import { supabase } from "@/lib/supabaseClient";
// import { useState } from "react";

// type SupabaseUploadButtonProps = {
//     bucket?: string;
//     folder?: string;
//     onUploadComplete?: (urls: string[]) => void;
// };

// export default function SupabaseUploadButton({ bucket = "product-images", folder = "products", onUploadComplete }: SupabaseUploadButtonProps) {
//     const [uploading, setUploading] = useState(false);

//     const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//         const files = event.target.files;
//         if (!files) return;

//         setUploading(true);
//         const urls: string[] = [];

//         for (const file of Array.from(files)) {
//             // create unique path
//             const filePath = `${folder}/${Date.now()}-${file.name}`;

//             const { error } = await supabase.storage.from(bucket).upload(filePath, file);

//             if (error) {
//                 console.error("Upload error:", error.message);
//                 continue;
//             }

//             // get public URL
//             const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
//             urls.push(data.publicUrl);
//         }

//         setUploading(false);

//         if (onUploadComplete) {
//             onUploadComplete(urls);
//         }
//     };

//     return (
//         <div>
//             <label className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded">
//                 {uploading ? "Uploading..." : "Upload Images"}
//                 <input type="file" multiple className="hidden" accept="image/*" onChange={handleUpload} />
//             </label>
//         </div>
//     );
// }

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { AlertCircle, Check } from "lucide-react";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

interface UploadedFile {
    file: File;
    url?: string;
    progress: number;
    status: "uploading" | "success" | "error";
    path?: string;
}

export default function SupabaseUploader({
    bucket = "images",
    folder = "uploads",
    onComplete,
}: {
    bucket?: string;
    folder?: string;
    onComplete?: (urls: string[]) => void;
}) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [open, setOpen] = useState(false);

    async function handleUpload(selectedFiles: FileList | null) {
        if (!selectedFiles) return;

        const newFiles = Array.from(selectedFiles).map((file) => ({
            file,
            progress: 0,
            status: "uploading" as const,
        }));

        setFiles((prev) => [...prev, ...newFiles]);
        setOpen(true);

        // Upload in parallel with progress
        await Promise.allSettled(
            newFiles.map(async (item: UploadedFile) => {
                const path = `${folder}/${Date.now()}-${item.file.name}`;
                const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from(bucket).createSignedUploadUrl(path);

                if (signedUrlError || !signedUrlData) {
                    item.status = "error";
                    setFiles((prev) => [...prev]);
                    return;
                }

                const { signedUrl } = signedUrlData;

                // Upload with XMLHttpRequest to track progress
                await new Promise<void>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open("PUT", signedUrl, true);

                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) {
                            const percent = Math.round((e.loaded / e.total) * 100);
                            item.progress = percent;
                            setFiles((prev) => [...prev]);
                        }
                    };

                    xhr.onload = async () => {
                        if (xhr.status === 200) {
                            const { data } = supabase.storage.from(bucket).getPublicUrl(path);
                            item.url = data.publicUrl;
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
            })
        );

        if (onComplete) {
            onComplete(newFiles.filter((f: UploadedFile) => f.url).map((f: UploadedFile) => f.url!));
        }
    }

    async function handleDelete(file: UploadedFile) {
        if (!file.path) return;

        await supabase.storage.from(bucket).remove([file.path]);
        setFiles((prev) => prev.filter((f) => f !== file));
    }

    return (
        <div>
            <button onClick={() => document.getElementById("fileInput")?.click()} className="px-4 py-2 bg-blue-600 text-white rounded-md">
                Upload Images
            </button>

            <input id="fileInput" type="file" multiple accept="image/*" hidden onChange={(e) => handleUpload(e.target.files)} />

            {open && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full md:max-w-2xl h-[100vh] md:h-[75vh] flex flex-col">
                        <div className="flex justify-between items-center border-b px-4 py-2">
                            <h2 className="font-semibold">Upload Queue</h2>
                            <button onClick={() => setOpen(false)}>✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {files.map((file, i) => (
                                    <div key={i} className="relative border rounded-lg overflow-hidden">
                                        <img
                                            src={file.url || URL.createObjectURL(file.file)}
                                            alt={file.file.name}
                                            className="w-full h-32 object-cover"
                                        />

                                        {file.status === "uploading" && (
                                            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gray-200">
                                                <div className="h-1.5 bg-blue-500" style={{ width: `${file.progress}%` }}></div>
                                            </div>
                                        )}

                                        {file.status === "success" && <Check className="h-4 w-4 text-green-500 absolute top-1 right-1" />}

                                        {file.status === "error" && <AlertCircle className="h-4 w-4 text-destructive absolute top-1 right-1" />}

                                        <button
                                            onClick={() => handleDelete(file)}
                                            className="absolute bottom-1 right-1 bg-red-500 text-white px-1 rounded text-xs"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t px-4 py-2 flex justify-between">
                            <button onClick={() => document.getElementById("fileInput")?.click()} className="text-blue-600">
                                Upload more
                            </button>
                            <button onClick={() => setOpen(false)} className="bg-orange-500 text-white px-4 py-1 rounded-md">
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
