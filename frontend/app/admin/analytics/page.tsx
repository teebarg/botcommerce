"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { tryCatch } from "@/lib/try-catch";
import { UserInteraction } from "@/schemas";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ComponentLoader from "@/components/component-loader";

const eventTypes = ["VIEW", "CART_ADD", "PURCHASE", "WISHLIST_ADD", "WISHLIST_REMOVE"];

function toCSV(rows: any[], columns: string[]): string {
    const header = columns.join(",");
    const body = rows.map((row) => columns.map((col) => JSON.stringify(row[col] ?? "")).join(",")).join("\n");

    return header + "\n" + body;
}

function downloadCSV(filename: string, csv: string) {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

const AnalyticsDashboard: React.FC = () => {
    const [interactions, setInteractions] = useState<UserInteraction[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [typeFilter, setTypeFilter] = useState<string>("");
    const [userFilter, setUserFilter] = useState<string>("");
    const [productFilter, setProductFilter] = useState<string>("");
    const [dateFilter, setDateFilter] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data, error } = await tryCatch<UserInteraction[]>(api.get("/user-interactions"));

            setLoading(false);
            if (error) {
                toast.error(error);

                return;
            }
            setInteractions(data);
        };

        fetchData();
    }, []);

    const filtered = interactions?.filter((i) => {
        return (
            (!typeFilter || i.type === typeFilter) &&
            (!userFilter || String(i.user_id) === userFilter) &&
            (!productFilter || String(i.product_id) === productFilter)
            // (!dateFilter || i.timestamp?.slice(0, 10) === dateFilter)
        );
    });

    // Heatmap data: 24x7 grid (hour x day)
    const heatmapGrid = Array.from({ length: 7 }, () => Array(24).fill(0));

    filtered?.forEach((i) => {
        const date = new Date(i.timestamp!);
        const day = date.getDay(); // 0=Sunday
        const hour = date.getHours();

        heatmapGrid[day][hour]++;
    });

    // Per-user breakdown
    const userBreakdown = (() => {
        const map: Record<string, number> = {};

        filtered?.forEach((i) => {
            map[i.user_id] = (map[i.user_id] || 0) + 1;
        });

        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    })();

    // Per-product breakdown
    const productBreakdown = (() => {
        const map: Record<string, number> = {};

        filtered?.forEach((i) => {
            map[i.product_id] = (map[i.product_id] || 0) + 1;
        });

        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    })();

    return (
        <div className="max-w-6xl mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">User Interaction Analytics</h1>
            <div className="mb-4 flex justify-end gap-2">
                <Button
                    variant="indigo"
                    onClick={() => {
                        const columns = ["id", "user_id", "product_id", "type", "timestamp", "metadata"];
                        const csv = toCSV(filtered!, columns);

                        downloadCSV("user_interactions.csv", csv);
                    }}
                >
                    Export CSV
                </Button>
            </div>
            <div className="mb-4 flex gap-2">
                {(userFilter || productFilter) && (
                    <Button
                        variant="outline"
                        onClick={() => {
                            setUserFilter("");
                            setProductFilter("");
                        }}
                    >
                        Clear Filter
                    </Button>
                )}
            </div>
            {loading && <ComponentLoader className="h-25" />}
            <div className="mb-6 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium">Type</label>
                    <select className="border rounded px-2 py-1" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                        <option value="">All</option>
                        {eventTypes.map((t, idx: number) => (
                            <option key={idx} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">User ID</label>
                    <input
                        className="border rounded px-2 py-1"
                        placeholder="User ID"
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Product ID</label>
                    <input
                        className="border rounded px-2 py-1"
                        placeholder="Product ID"
                        value={productFilter}
                        onChange={(e) => setProductFilter(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Date</label>
                    <input className="border rounded px-2 py-1" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
                </div>
            </div>
            <div className="mb-8 bg-secondary rounded shadow p-4">
                <h2 className="text-lg font-semibold mb-2">Activity Heatmap (Hour x Day)</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-center">
                        <thead>
                            <tr>
                                <th className="px-2 py-1">Day/Hour</th>
                                {Array.from({ length: 24 }).map((_, h) => (
                                    <th key={h} className="px-2 py-1">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {heatmapGrid.map((row, d) => (
                                <tr key={d}>
                                    <td className="px-2 py-1 font-bold">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]}</td>
                                    {row.map((val, h) => (
                                        <td key={h} className={`px-2 py-1 ${val > 0 ? "bg-blue-400" : "bg-content3"}`}>
                                            {val || ""}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-lg font-semibold mb-2">Per-User Breakdown</h2>
                    <table className="min-w-full bg-secondary rounded shadow">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">User ID</th>
                                <th className="px-4 py-2">Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userBreakdown.map(([user, count]) => (
                                <tr key={user}>
                                    <td className="border px-4 py-2">
                                        <button className="underline text-blue-600 hover:text-blue-800" onClick={() => setUserFilter(user)}>
                                            {user}
                                        </button>
                                    </td>
                                    <td className="border px-4 py-2">{count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-2">Per-Product Breakdown</h2>
                    <table className="min-w-full bg-secondary rounded shadow">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Product ID</th>
                                <th className="px-4 py-2">Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productBreakdown.map(([product, count], idx: number) => (
                                <tr key={idx}>
                                    <td className="border px-4 py-2">
                                        <button className="underline text-blue-600 hover:text-blue-800" onClick={() => setProductFilter(product)}>
                                            {product}
                                        </button>
                                    </td>
                                    <td className="border px-4 py-2">{count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Recent Interactions</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-secondary rounded shadow">
                    <thead>
                        <tr>
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">User</th>
                            <th className="px-4 py-2">Product</th>
                            <th className="px-4 py-2">Type</th>
                            <th className="px-4 py-2">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered?.slice(0, 20).map((i, idx: number) => (
                            <tr key={idx}>
                                <td className="border px-4 py-2">{i.id}</td>
                                <td className="border px-4 py-2">{i.user_id}</td>
                                <td className="border px-4 py-2">{i.product_id}</td>
                                <td className="border px-4 py-2">{i.type}</td>
                                <td className="border px-4 py-2">{formatDate(i.timestamp?.toString() || "")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
