import { useState } from "react";
import { motion } from "framer-motion";
import { Send, User, Mail, FileText, CheckCircle } from "lucide-react";

interface EscalationFormProps {
    onSubmitForm: (formType: string, formData: any) => void;
    isLastMessage: boolean;
}

const EscalationForm = ({ onSubmitForm, isLastMessage }: EscalationFormProps) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [summary, setSummary] = useState("");
    const [orderId, setOrderId] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = "Name is required";
        if (!email.trim()) errs.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Invalid email";
        if (!summary.trim()) errs.summary = "Please describe your issue";
        return errs;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setSubmitted(true);
        onSubmitForm("escalation_details", { name: name.trim(), email: email.trim(), summary: summary.trim(), order_number: orderId.trim() });
    };

    if (!isLastMessage || submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-2 rounded-xl border border-border bg-card p-4 flex items-center gap-3"
            >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <p className="text-xs font-semibold text-foreground">Details submitted</p>
                    <p className="text-[11px] text-muted-foreground">A human agent will reach out to you shortly.</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.form
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="mt-2 rounded-xl border border-border bg-card p-3 space-y-2.5"
        >
            <p className="text-xs font-semibold text-foreground">Please share your details so our team can follow up:</p>

            {/* Name */}
            <div className="space-y-1">
                <div className="relative">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setErrors((p) => ({ ...p, name: "" }));
                        }}
                        placeholder="Your name"
                        maxLength={100}
                        className="w-full bg-secondary rounded-lg pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                    />
                </div>
                {errors.name && <p className="text-[10px] text-destructive pl-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1">
                <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setErrors((p) => ({ ...p, email: "" }));
                        }}
                        placeholder="Email address"
                        type="email"
                        maxLength={255}
                        className="w-full bg-secondary rounded-lg pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                    />
                </div>
                {errors.email && <p className="text-[10px] text-destructive pl-1">{errors.email}</p>}
            </div>

            {/* Summary */}
            <div className="space-y-1">
                <div className="relative">
                    <FileText className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                    <textarea
                        value={summary}
                        onChange={(e) => {
                            setSummary(e.target.value);
                            setErrors((p) => ({ ...p, summary: "" }));
                        }}
                        placeholder="Briefly describe your issue..."
                        rows={2}
                        maxLength={500}
                        className="w-full bg-secondary rounded-lg pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-shadow resize-none"
                    />
                </div>
                {errors.summary && <p className="text-[10px] text-destructive pl-1">{errors.summary}</p>}
            </div>

            <div className="space-y-1">
                <div className="relative">
                    <FileText className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                    <textarea
                        value={orderId}
                        onChange={(e) => {
                            setOrderId(e.target.value);
                            setErrors((p) => ({ ...p, orderId: "" }));
                        }}
                        placeholder="Order ID (optional)"
                        rows={2}
                        maxLength={500}
                        className="w-full bg-secondary rounded-lg pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-shadow resize-none"
                    />
                </div>
                {errors.orderId && <p className="text-[10px] text-destructive pl-1">{errors.orderId}</p>}
            </div>

            <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2 text-xs font-semibold transition-opacity hover:opacity-90"
            >
                <Send className="w-3.5 h-3.5" />
                Submit & Connect
            </motion.button>
        </motion.form>
    );
};

export default EscalationForm;
