"use client";

import { User } from "@nextui-org/user";
import { signOut } from "@modules/account/actions";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import React from "react";
import Dropdown from "@modules/common/components/dropdown";

export default function UserDropDown({ customer }: any) {
    const handleLogout = async () => {
        await signOut();
    };

    return (
        <React.Fragment>
            <Dropdown
                trigger={
                    <User
                        // as="button"
                        avatarProps={{
                            isBordered: true,
                            src: customer?.image || "https://i.pravatar.cc/150?u=a042581f4e29026024d",
                        }}
                        className="transition-transform"
                        description={customer?.email}
                        name={customer?.lastname}
                    />
                }
            >
                <div className="bg-content1 box-border rounded-lg shadow-md p-3 min-w-[150px] text-sm font-medium">
                    <div key="user" className="h-14 gap-2">
                        <p className="font-bold">Signed in as</p>
                        <p className="font-bold">@{customer?.firstname}</p>
                    </div>

                    <div
                        className="flex group gap-2 items-center justify-between relative px-2 py-1.5 w-full h-full box-border rounded-small cursor-pointer outline-none data-[hover=true]:transition-colors data-[hover=true]:bg-default/40 data-[hover=true]:text-default-foreground data-[selectable=true]:focus:bg-default/40 data-[selectable=true]:focus:text-default-foreground"
                        data-key="admin"
                    >
                        <span className="flex-1 text-small font-normal truncate">
                            <LocalizedClientLink href="/account/profile">Profile</LocalizedClientLink>
                        </span>
                    </div>
                    <div
                        className="flex group gap-2 items-center justify-between relative px-2 py-1.5 w-full h-full box-border rounded-small cursor-pointer outline-none data-[hover=true]:transition-colors data-[hover=true]:bg-default/40 data-[hover=true]:text-default-foreground data-[selectable=true]:focus:bg-default/40 data-[selectable=true]:focus:text-default-foreground"
                        data-key="account"
                    >
                        <span className="flex-1 text-small font-normal truncate">
                            <LocalizedClientLink href="/account">Dashboard</LocalizedClientLink>
                        </span>
                    </div>
                    <div
                        className="flex group gap-2 items-center justify-between relative px-2 py-1.5 w-full h-full box-border rounded-small cursor-pointer outline-none data-[hover=true]:transition-colors data-[hover=true]:bg-default/40 data-[hover=true]:text-default-foreground data-[selectable=true]:focus:bg-default/40 data-[selectable=true]:focus:text-default-foreground"
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
