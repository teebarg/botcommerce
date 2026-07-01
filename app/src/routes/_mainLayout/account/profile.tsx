import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Message } from "@/schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { tryCatch } from "@/utils/try-catch";
import { Separator } from "@/components/ui/separator";
import { api } from "@/utils/api";
import { getInitials } from "@/utils";

const profileSchema = z.object({
    first_name: z.string().min(1, "First name is required").max(255, "First name is too long"),
    last_name: z.string().min(1, "Last name is required").max(255, "Last name is too long"),
});

const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export const Route = createFileRoute("/_mainLayout/account/profile")({
    component: RouteComponent,
});

function RouteComponent() {
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [isPending, setIsPending] = useState<boolean>(false);
    const { user } = Route.useRouteContext();

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: user?.firstName ?? "",
            last_name: user?.lastName ?? "",
        },
    });

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const handleProfileSave = async (data: ProfileFormValues) => {
        setIsPending(true);
        const { error } = await tryCatch<Message>(api.patch<Message>("/users/me", data));

        if (error) {
            toast.error(error);
            setIsPending(false);

            return;
        }
        toast.success("Profile updated successfully");
        setEditingSection(null);
        setIsPending(false);
    };

    const handleEdit = (section: string) => {
        setEditingSection(section);
    };

    const handleCancel = () => {
        setEditingSection(null);
        profileForm.reset();
        passwordForm.reset();
    };

    return (
        <div className="space-y-6 pt-6 slide-in">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Profile Details</h2>
                <p className="text-muted-foreground text-sm">Manage your personal information</p>
            </div>

            <div className="flex flex-col items-center">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-accent p-1">
                        <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                            <span className="text-3xl font-bold text-foreground">
                                {getInitials(user?.firstName ?? "")}
                            </span>
                        </div>
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg">
                        <Camera className="w-4 h-4 text-accent-foreground" />
                    </button>
                </div>
                <p className="mt-3 font-semibold">
                    {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>

            <div className="px-2 md:px-0">
                <div className="bg-card rounded-xl shadow-sm border border-border mb-6">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h3 className="text-base font-semibold">Profile Information</h3>
                            <p className="text-xs text-muted-foreground">Update your personal details</p>
                        </div>
                        {editingSection !== "profile" && (
                            <Button size="md" onClick={() => handleEdit("profile")}>
                                Edit
                            </Button>
                        )}
                    </div>
                    <Separator />

                    <div className="p-6">
                        <Form {...profileForm}>
                            <form onSubmit={profileForm.handleSubmit(handleProfileSave)}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <FormField
                                        control={profileForm.control}
                                        name="first_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name</FormLabel>
                                                <FormControl>
                                                    {editingSection === "profile" ? (
                                                        <Input placeholder="Enter first name" {...field} />
                                                    ) : (
                                                        <div className="px-4 py-2 rounded-lg text-foreground bg-secondary">
                                                            {field.value || "Not set"}
                                                        </div>
                                                    )}
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={profileForm.control}
                                        name="last_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Last Name</FormLabel>
                                                <FormControl>
                                                    {editingSection === "profile" ? (
                                                        <Input placeholder="Enter last name" {...field} />
                                                    ) : (
                                                        <div className="px-4 py-2 rounded-lg text-foreground bg-secondary">
                                                            {field.value || "Not set"}
                                                        </div>
                                                    )}
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">Email Address</label>
                                    <div className="px-4 py-2 rounded-lg text-foreground bg-secondary">{user?.email}</div>
                                </div>

                                {editingSection === "profile" && (
                                    <div className="flex gap-2 mt-6">
                                        <Button size="md" disabled={isPending} isLoading={isPending} type="submit">
                                            Save Changes
                                        </Button>
                                        <Button size="md" variant="destructive" onClick={handleCancel}>
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
}
