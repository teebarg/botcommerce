import { Metadata } from "next";
import React from "react";
import { Table } from "@modules/common/components/table";
import { Card, CardHeader, CardTitle, CardContent } from "components/ui/card";
import { Activity, CreditCard, Users } from "nui-react-icons";

import { Pag } from "@/types/models";

const users = [
    {
        id: 1,
        first_name: "John Doe",
        email: "john.doe@gmail.com",
        role: "admin",
        status: "active",
        created_at: "2021-01-01",
    },
    {
        id: 2,
        first_name: "Jane Doe",
        email: "jane.doe@gmail.com",
        role: "user",
        status: "active",
        created_at: "2021-01-01",
    },
    {
        id: 3,
        first_name: "Tom Doe",
        email: "tom.doe@gmail.com",
        role: "user",
        status: "inactive",
        created_at: "2021-01-01",
    },
    {
        id: 4,
        first_name: "Jerry Doe",
        email: "jerry.doe@yahoo.com",
        role: "user",
        status: "active",
        created_at: "2021-01-01",
    },
    {
        id: 5,
        first_name: "Anne Doe",
        email: "anne.doe@email.com",
        role: "user",
        status: "active",
        created_at: "2021-01-01",
    },
];

const stats = [
    {
        title: "Total Revenue",
        icon: <Users className="text-default-500" />,
        content: "$45,231.89",
        subContent: "+20.1% from last month",
    },
    {
        title: "Subscriptions",
        icon: <Users className="text-default-500" />,
        content: "+3402",
        subContent: "+20.1% from last month",
    },
    {
        title: "Active Now",
        icon: <Activity className="text-default-500" />,
        content: "+304",
        subContent: "+20.1% from last month",
    },
    {
        title: "Sales",
        icon: <CreditCard className="text-default-500" />,
        content: "+102304",
        subContent: "+20.1% from last month",
    },
];

const pagination: Pag = {
    page: 1,
    limit: 5,
    total_count: 6,
    total_pages: 2,
};

export const metadata: Metadata = {
    title: "Admin",
    description: "Admin dashboard",
};

export default async function AdminPage() {
    return (
        <React.Fragment>
            <div className="px-2 md:px-8 py-4">
                <div className="grid gap-6 mb-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                        {stats?.map((item, index: any) => (
                            <Card key={index}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                                    {item.icon}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{item.content}</div>
                                    <p className="text-xs text-default-500">{item.subContent}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
                <Table canExport columns={["", "Firstname", "Email", "Role", "Status", "Created At"]} pagination={pagination}>
                    {users
                        ?.sort((a: any, b: any) => (a.created_at > b.created_at ? -1 : 1))
                        .map((item: any, index: number) => (
                            <tr key={item.id} className="even:bg-content2">
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-3">{index + 1},</td>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-3">{item.first_name}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">{item.email}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">{item.role}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">{item.status}</td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">{item.created_at}</td>
                            </tr>
                        ))}
                </Table>
            </div>
        </React.Fragment>
    );
}
