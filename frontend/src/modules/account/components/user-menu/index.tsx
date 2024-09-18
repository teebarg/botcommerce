"use client";

import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/dropdown";
import { User } from "@nextui-org/user";
import { signOut } from "@modules/account/actions";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

export default function UserDropDown({ customer }: any) {
    const handleLogout = async () => {
        await signOut();
    };

    return (
        <Dropdown placement="bottom-start">
            <DropdownTrigger>
                <User
                    as="button"
                    avatarProps={{
                        isBordered: true,
                        src: customer?.image || "https://i.pravatar.cc/150?u=a042581f4e29026024d",
                    }}
                    className="transition-transform"
                    description={customer?.email}
                    name={customer?.lastname}
                />
            </DropdownTrigger>
            <DropdownMenu aria-label="User Actions" variant="flat">
                <DropdownItem key="user" className="h-14 gap-2">
                    <p className="font-bold">Signed in as</p>
                    <p className="font-bold">@{customer?.firstname}</p>
                </DropdownItem>

                <DropdownItem key="admin">
                    <LocalizedClientLink href="/account/profile">Profile</LocalizedClientLink>
                </DropdownItem>
                <DropdownItem key="account">
                    <LocalizedClientLink href="/account">Dashboard</LocalizedClientLink>
                </DropdownItem>
                <DropdownItem key="logout" color="danger">
                    <button data-testid="logout-button" type="button" onClick={handleLogout}>
                        Log out
                    </button>
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
}
