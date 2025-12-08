import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import z from "zod";
import { useConfig } from "@/providers/store-provider";

export const Route = createFileRoute("/_authLayout")({
    validateSearch: z.object({
        callbackUrl: z.string().optional(),
    }),
    beforeLoad: ({ context, search }) => {
        if (context.session) {
            if (search.callbackUrl) {
                throw redirect({ to: search.callbackUrl });
            }
            throw redirect({ to: "/" });
        }
        return {
            callbackUrl: search.callbackUrl,
        };
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { config } = useConfig();

    return (
        <div className="h-screen flex flex-col">
            <nav className="w-full max-w-md p-6 fixed top-0">
                <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-linear-to-br from-primary to-contrast rounded-lg flex items-center justify-center">
                            <span className="text-lg font-bold text-white">M</span>
                        </div>
                        <Link to="/">
                            <span className="text-xl font-semibold bg-clip-text text-transparent bg-linear-to-r from-primary to-contrast">
                                {config?.shop_name}
                            </span>
                        </Link>
                    </div>
                </div>
            </nav>
            <div className="flex items-center justify-center flex-1">
                <div className="bg-card px-3 py-6 rounded-lg">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
