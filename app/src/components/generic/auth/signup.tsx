import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import LocalizedClientLink from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import SocialLoginButtons from "@/components/generic/auth/social-login-buttons";
import { useConfig } from "@/providers/store-provider";
import { Separator } from "@/components/ui/separator";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";

const signUpSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.email(),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

type Props = {};

const SignUpForm: React.FC<Props> = () => {
    const [show, setShow] = useState<boolean>(false);
    const { config } = useConfig();
    const form = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            password: "",
        },
    });
    const { handleSubmit, control } = form;
    const [isPending, setIsPending] = useState(false);

    const onSubmit = async (values: SignUpFormValues) => {
        setIsPending(true);
        // const { error } = await authApi.signUp(values);

        setIsPending(false);
        // if (error) {
        //     toast.error(error || "Sign up failed");

        //     return;
        // }
        toast.success("Please check your email to verify your account");
        window.location.href = "/";
    };

    return (
        <React.Fragment>
            <Form {...form}>
                <form className="w-full flex flex-col" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <FormField
                            control={control}
                            name="first_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First name</FormLabel>
                                    <FormControl>
                                        <Input required autoComplete="given-name" data-testid="first-name-input" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="last_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last name</FormLabel>
                                    <FormControl>
                                        <Input required autoComplete="family-name" data-testid="last-name-input" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input required autoComplete="email" data-testid="email-input" type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input autoComplete="tel" data-testid="phone-input" type="tel" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="password"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            required
                                            autoComplete="new-password"
                                            data-testid="password-input"
                                            endContent={
                                                show ? (
                                                    <Eye className="h-6 w-6" onClick={() => setShow(false)} />
                                                ) : (
                                                    <EyeOff className="h-6 w-6" onClick={() => setShow(true)} />
                                                )
                                            }
                                            type={show ? "text" : "password"}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <span className="text-center text-muted-foreground text-xs mt-6">
                        By creating an account, you agree to {config?.shop_name} Store&apos;s{" "}
                        <LocalizedClientLink className="underline" href="/content/privacy-policy">
                            Privacy Policy
                        </LocalizedClientLink>{" "}
                        and{" "}
                        <LocalizedClientLink className="underline" href="/content/terms-of-use">
                            Terms of Use
                        </LocalizedClientLink>
                        .
                    </span>
                    <Button aria-label="join us" className="w-full mt-6" data-testid="register-button" isLoading={isPending} size="lg" type="submit">
                        Join Us
                    </Button>
                </form>
            </Form>
            <Separator className="my-6" />
            <SocialLoginButtons />
        </React.Fragment>
    );
};

export { SignUpForm };
