import { MapPin } from "lucide-react";
import { useConfig } from "@/providers/store-provider";

const PickupCard = () => {
    const { address } = useConfig();

    return (
        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
                <p className="text-sm font-medium">Pickup point</p>
                <p className="text-md text-muted-foreground mt-0.5">{address}</p>
                <p className="text-sm text-muted-foreground">Open Mon–Sat: 9am–6pm</p>
            </div>
        </div>
    );
};

export default PickupCard;
