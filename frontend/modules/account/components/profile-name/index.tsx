"use client";

import React from "react";
import { Input } from "@components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import AccountInfo from "../account-info";

import { User } from "@/lib/models";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { api } from "@/apis";

const nameSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
});

type NameFormValues = z.infer<typeof nameSchema>;

type MyInformationProps = {
    customer: Omit<User, "password_hash">;
};

const ProfileName: React.FC<MyInformationProps> = ({ customer }) => {
    const [isPending, setIsPending] = React.useState<boolean>(false);

    const form = useForm<NameFormValues>({
        resolver: zodResolver(nameSchema),
        defaultValues: {
            first_name: customer.first_name || "",
            last_name: customer.last_name || "",
        },
    });

    const clearState = () => {
        form.reset();
    };

    const onSubmit = async (updateData: NameFormValues) => {
        setIsPending(true);

        const { error } = await api.user.update(customer.id, updateData);

        if (error) {
            toast.error(error);
            setIsPending(false);

            return;
        }

        setIsPending(false);
        toast.success("Billing address updated successfully");
    };

    return (
        <form className="w-full overflow-visible" onReset={() => clearState()} onSubmit={form.handleSubmit(onSubmit)}>
            <AccountInfo
                clearState={clearState}
                currentInfo={`${customer.first_name} ${customer.last_name}`}
                data-testid="account-name-editor"
                isLoading={isPending}
                label="Name"
            >
                <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First name</FormLabel>
                                <FormControl>
                                    <Input required data-testid="first-name-input" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last name</FormLabel>
                                <FormControl>
                                    <Input required data-testid="last-name-input" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </AccountInfo>
        </form>
    );
};

export default ProfileName;
