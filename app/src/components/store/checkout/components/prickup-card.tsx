import React from "react";
import { MapPin } from "lucide-react";
import { useConfig } from "@/providers/store-provider";

interface Props { }

const PickupCard: React.FC<Props> = () => {
    const { address } = useConfig();

    return (
        <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-3 mb-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                    <p className="text-sm font-medium">Pickup point</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{address}</p>
                    <p className="text-sm text-muted-foreground">Open Mon–Sat: 9am–6pm</p>
                </div>
            </div>

            <div className="pt-3 border-t border-border">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">Important information</p>
                <ul className="space-y-1.5">
                    {[
                        "Bring your order confirmation email",
                        "Pay with cash or card at collection",
                        "Orders are held for 3 days before being returned to stock",
                    ].map((item) => (
                        <li key={item} className="text-xs text-muted-foreground pl-3 relative before:content-['·'] before:absolute before:left-0">
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default PickupCard;
