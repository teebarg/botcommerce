import { Metadata } from "next";
import { Pagination as PaginationType } from "types/global";
import React from "react";
import { Table } from "@modules/common/components/table";
import { Card, CardHeader, CardTitle, CardContent } from "components/ui/card";
import { Activity, CreditCard, Users } from "nui-react-icons";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";

const users = [
    {
        id: 1,
        firstname: "John Doe",
        email: "john.doe@gmail.com",
        role: "admin",
        status: "active",
        created_at: "2021-01-01",
    },
    {
        id: 2,
        firstname: "Jane Doe",
        email: "jane.doe@gmail.com",
        role: "user",
        status: "active",
        created_at: "2021-01-01",
    },
    {
        id: 3,
        firstname: "Tom Doe",
        email: "tom.doe@gmail.com",
        role: "user",
        status: "inactive",
        created_at: "2021-01-01",
    },
    {
        id: 4,
        firstname: "Jerry Doe",
        email: "jerry.doe@yahoo.com",
        role: "user",
        status: "active",
        created_at: "2021-01-01",
    },
    {
        id: 5,
        firstname: "Anne Doe",
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

const pagination: PaginationType = {
    page: 1,
    limit: 5,
    total_count: 6,
    total_pages: 2,
};

export const metadata: Metadata = {
    title: `Children clothing | ${siteConfig.name} Store`,
    description: siteConfig.description,
};

export default async function AdminPage() {
    return (
        <React.Fragment>
            <div className="px-8 py-4">
                <div className="grid gap-6 mb-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                        {stats.map((item, index: any) => (
                            <Card key={index}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                                    {item.icon}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{item.content}</div>
                                    <p className="text-xs text-muted-foreground">{item.subContent}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-none shadow-medium rounded-large transition-transform-background max-w-[340px] mb-12 p-6">
                    <div className="flex p-3 z-10 w-full items-center shrink-0 overflow-inherit color-inherit rounded-t-large justify-between">
                        <div className="flex gap-5">
                            <span className="flex relative justify-center items-center box-border overflow-hidden align-middle z-0 outline-none w-10 h-10 text-tiny bg-default text-default-foreground rounded-full">
                                <Image
                                    fill
                                    alt="avatar"
                                    className="flex object-cover w-full h-full transition-opacity !duration-500 opacity-0"
                                    src="/avatar_ai.png"
                                />
                            </span>
                            <div className="flex flex-col gap-1 items-start justify-center">
                                <h4 className="text-small font-semibold leading-none text-default-900">Zoey Lang</h4>
                                <h5 className="text-small tracking-tight text-default-500">@zoeylang</h5>
                            </div>
                        </div>
                        <Button>Follow</Button>
                    </div>
                    <div className="relative flex w-full p-3 flex-auto flex-col place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto px-3 py-0 text-small text-default-500">
                        <p>Frontend developer and UI/UX enthusiast. Join me on this coding adventure!</p>
                        <span className="pt-2">
                            #FrontendWithZoey
                            <span aria-label="computer" className="py-2" role="img">
                                💻
                            </span>
                        </span>
                    </div>

                    <div className="p-3 h-auto flex w-full items-center overflow-hidden color-inherit rounded-b-large gap-3 text-default-500">
                        <div className="flex gap-1">
                            <p className="font-semibold text-small">4</p>
                            <p className="text-default-500 text-small">Following</p>
                        </div>
                        <div className="flex gap-1">
                            <p className="font-semibold text-small">97.1K</p>
                            <p className="text-default-500 text-small">Followers</p>
                        </div>
                    </div>
                </div>
                <Table canExport columns={["", "Firstname", "Email", "Role", "Status", "Created At"]} pagination={pagination}>
                    {users
                        ?.sort((a: any, b: any) => (a.created_at > b.created_at ? -1 : 1))
                        .map((item: any, index: number) => (
                            <tr key={item.id} className="even:bg-content2">
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-3">{index + 1},</td>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-3">{item.firstname}</td>
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
