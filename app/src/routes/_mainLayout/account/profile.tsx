import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Camera } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Message } from "@/schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useInvalidate } from "@/hooks/useApi";
import ServerError from "@/components/generic/server-error";
import { tryCatch } from "@/utils/try-catch";
import { Separator } from "@/components/ui/separator";
import { updateMeFn, updatePasswordFn } from "@/server/users.server";
import { updateAuthSession } from "@/utils/auth-client";
import { motion } from "framer-motion";

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
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const invalidate = useInvalidate();
    const [isPending, setIsPending] = useState<boolean>(false);
    const { session } = Route.useRouteContext();

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: session?.user?.first_name ?? "",
            last_name: session?.user?.last_name ?? "",
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
        const { error } = await tryCatch<Message>(updateMeFn({ data }));

        if (error) {
            toast.error(error);
            setIsPending(false);

            return;
        }
        await updateAuthSession({
            email: session?.user?.email!,
            mode: "refresh",
        });
        invalidate("me");
        toast.success("Profile updated successfully");
        setEditingSection(null);
        setIsPending(false);
    };

    const handlePasswordSave = async (data: PasswordFormValues) => {
        setIsPending(true);
        const { error } = await tryCatch<Message>(updatePasswordFn({ data }));

        if (error) {
            toast.error(error);
            setIsPending(false);

            return;
        }
        invalidate("me");
        toast.success("Password updated successfully");
        setEditingSection(null);
        passwordForm.reset();
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

    if (!session) {
        return <ServerError error="Failed to get session" scenario="profile" stack="Invalid session" />;
    }

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <h2 className="text-2xl font-bold mb-2">Profile Details</h2>
                <p className="text-muted-foreground">Manage your personal information</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center"
            >
                <div className="relative">
                    <div className="w-24 h-24 rounded-full gradient-primary p-1">
                        <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                            <span className="text-3xl font-bold">
                                {session?.user?.first_name[0]}
                                {session?.user?.last_name?.[0]}
                            </span>
                        </div>
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                        <Camera className="w-4 h-4 text-white" />
                    </button>
                </div>
                <p className="mt-3 font-semibold">
                    {session?.user?.first_name} {session?.user?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            </motion.div>

            <div className="py-8 px-2 md:px-0">
                <div className="bg-card rounded-xl shadow-sm border border-border mb-6 transition-colors duration-300">
                    <div className="flex items-center justify-between p-6">
                        <div>
                            <h3 className="text-lg font-semibold">Profile Information</h3>
                            <p className="text-sm text-muted-foreground">Update your personal details</p>
                        </div>
                        {editingSection !== "profile" && (
                            <Button className="mt-2 md:mt-0" onClick={() => handleEdit("profile")}>
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
                                                        <div className="px-4 py-3 rounded-lg text-foreground bg-secondary">
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
                                                        <div className="px-4 py-3 rounded-lg text-foreground bg-secondary">
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
                                    <div className="px-4 py-3 rounded-lg text-foreground bg-secondary">{session?.user?.email}</div>
                                </div>

                                {editingSection === "profile" && (
                                    <div className="flex space-x-3 mt-6">
                                        <Button disabled={isPending} isLoading={isPending} type="submit">
                                            Save Changes
                                        </Button>
                                        <Button type="button" variant="outline" onClick={handleCancel}>
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </Form>
                    </div>
                </div>
                <div className="bg-card rounded-xl shadow-sm border border-border transition-colors duration-300">
                    <div className="p-6 border-b border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Password</h3>
                                <p className="text-sm text-muted-foreground">Update your password</p>
                            </div>
                            {editingSection !== "password" && (
                                <Button className="mt-2 md:mt-0" onClick={() => handleEdit("password")}>
                                    Change Password
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="p-6">
                        <Form {...passwordForm}>
                            <form onSubmit={passwordForm.handleSubmit(handlePasswordSave)}>
                                {editingSection === "password" ? (
                                    <div className="space-y-4">
                                        <FormField
                                            control={passwordForm.control}
                                            name="currentPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Current Password</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                placeholder="Enter current password"
                                                                type={showPassword ? "text" : "password"}
                                                                {...field}
                                                            />
                                                            <button
                                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                            >
                                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                            </button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={passwordForm.control}
                                            name="newPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>New Password</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter new password" type="password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={passwordForm.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Confirm New Password</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Confirm new password" type="password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="flex space-x-3 mt-6">
                                            <Button disabled={isPending} isLoading={isPending} type="submit">
                                                Update Password
                                            </Button>
                                            <Button type="button" variant="outline" onClick={handleCancel}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="px-4 py-3 rounded-lg bg-secondary text-muted-foreground">
                                        Password is hidden for security reasons
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
