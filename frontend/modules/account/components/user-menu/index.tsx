"use client";

import { signOut } from "@modules/account/actions";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import React from "react";
import Dropdown from "@modules/common/components/dropdown";
import Image from "next/image";

export default function UserDropDown({ customer }: any) {
    const handleLogout = async () => {
        await signOut();
    };

    return (
        <React.Fragment>
            <Dropdown
                align="end"
                className="w-full"
                trigger={
                    <React.Fragment>
                        <div className="flex items-center gap-2 rounded-small outline-none transition-transform w-full">
                            <span className="overflow-hidden z-0 outline-none w-10 h-10 rounded-full ring-2 ring-offset-2 ring-offset-background dark:ring-offset-background-dark ring-default">
                                <Image fill alt="avatar" className="flex object-cover w-full h-full" src={customer?.image} />
                            </span>
                            <div className="inline-flex flex-1 justify-between">
                                <div className="inline-flex flex-col items-start justify-center">
                                    <span className="text-small text-default-900">{customer?.lastname}</span>
                                    <span className="text-tiny text-default-500">{customer?.email}</span>
                                </div>
                                <span
                                    className="md:hidden bg-transparent border-2 border-secondary text-secondary py-0.5 px-4 rounded-full flex items-center mt-2"
                                    data-testid="logout-button"
                                    role="button"
                                    onClick={handleLogout}
                                >
                                    Log out
                                </span>
                            </div>
                        </div>
                    </React.Fragment>
                }
            >
                <div className="bg-content1 box-border rounded-lg shadow-md p-3 min-w-[200px] text-sm font-medium">
                    <div key="user" className="h-14 gap-2">
                        <p className="font-bold">Signed in as</p>
                        <p className="font-bold">@{customer?.firstname}</p>
                    </div>

                    <div
                        className="flex group gap-2 items-center justify-between relative px-2 py-1.5 w-full h-full box-border rounded-small cursor-pointer outline-none"
                        data-key="admin"
                    >
                        <span className="flex-1 text-small font-normal truncate">
                            <LocalizedClientLink href="/account/profile">Profile</LocalizedClientLink>
                        </span>
                    </div>
                    <div
                        className="flex group gap-2 items-center justify-between relative px-2 py-1.5 w-full h-full box-border rounded-small cursor-pointer outline-none"
                        data-key="account"
                    >
                        <span className="flex-1 text-small font-normal truncate">
                            <LocalizedClientLink href="/account">Dashboard</LocalizedClientLink>
                        </span>
                    </div>
                    <div
                        className="flex group gap-2 items-center justify-between relative px-2 py-1.5 w-full h-full box-border rounded-small cursor-pointer outline-none"
                        data-key="logout"
                    >
                        <button data-testid="logout-button" type="button" onClick={handleLogout}>
                            Log out
                        </button>
                    </div>
                </div>
            </Dropdown>
        </React.Fragment>
    );
}
