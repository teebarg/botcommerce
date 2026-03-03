import { motion } from "framer-motion";
import { ArrowRightLeft, Headphones, Shield } from "lucide-react";

interface HandoffBannerProps {
    agentName?: string;
}

const HandoffBanner = ({ agentName = "Sarah M." }: HandoffBannerProps) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="my-4"
    >
        {/* Divider line */}
        <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-border" />
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border">
                <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Handoff</span>
            </div>
            <div className="flex-1 h-px bg-border" />
        </div>

        {/* Agent card */}
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-3.5"
        >
            <div className="flex items-center gap-3">
                {/* Agent avatar */}
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                        <Headphones className="w-5 h-5 text-primary" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-foreground">{agentName}</p>
                        <Shield className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">Human support agent • Just joined</p>
                </div>
            </div>

            {/* Info strip */}
            <div className="mt-2.5 flex items-center gap-4 pt-2 border-t border-primary/10">
                <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] text-muted-foreground">Available now</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Avg. response: &lt;1 min</span>
            </div>
        </motion.div>
    </motion.div>
);

export default HandoffBanner;
