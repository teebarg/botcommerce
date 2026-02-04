import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOverlayTriggerState } from "react-stately";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateGuestUser } from "@/hooks/useUser";
import SheetDrawer from "@/components/sheet-drawer";

const formSchema = z.object({
    first_name: z.string().min(1, { message: "First name is required" }),
    last_name: z.string().min(1, { message: "Last name is required" }),
});

export default function CustomerCreateGuest() {
    const createState = useOverlayTriggerState({});
    const { mutate: createGuest, isPending } = useCreateGuestUser();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        createGuest(values, {
            onSuccess: () => {
                createState.close();
                form.reset();
            },
        });
    };

    return (
        <SheetDrawer
            title="Create Guest User"
            trigger={
                <Button size="sm" variant="outline">
                    Create Guest User
                </Button>
            }
            open={createState.isOpen}
            onOpenChange={createState.toggle}
        >
            <Form {...form}>
                <form className="space-y-4 flex-1 flex flex-col" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex-1 overflow-y-auto space-y-4 px-4">
                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John" {...field} />
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
                                        <Input placeholder="Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex justify-end gap-2 px-4 py-4 border-t border-border">
                        <Button type="button" variant="destructive" onClick={() => createState.close()}>
                            Cancel
                        </Button>
                        <Button disabled={isPending} isLoading={isPending} type="submit">
                            Create
                        </Button>
                    </div>
                </form>
            </Form>
        </SheetDrawer>
    );
}
