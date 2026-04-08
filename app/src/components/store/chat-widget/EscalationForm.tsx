import { useState } from "react";
import { Send, User, Mail, FileText, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EscalationFormProps {
    onSubmitForm: (formType: string, formData: any) => void;
    isLastMessage: boolean;
}

const ISSUE_CATEGORIES = [
    { value: "billing", label: "Billing" },
    { value: "delivery", label: "Delivery" },
    { value: "technical", label: "Technical" },
    { value: "account", label: "Account" },
    { value: "other", label: "Other" },
];

const EscalationForm = ({ onSubmitForm, isLastMessage }: EscalationFormProps) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [summary, setSummary] = useState("");
    const [orderId, setOrderId] = useState("");
    const [category, setCategory] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = "Name is required";
        if (!email.trim()) errs.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Invalid email";
        if (!category) errs.category = "Please select a category";
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
        onSubmitForm("escalation_details", {
            name: name.trim(),
            email: email.trim(),
            category,
            summary: summary.trim(),
            order_number: orderId.trim(),
        });
    };

    if (!isLastMessage || submitted) {
        return null;
    }

    return (
        <form onSubmit={handleSubmit} className="mt-2 rounded-xl border border-border bg-card p-3 space-y-2.5">
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

            <div className="space-y-1">
                <select
                    value={category}
                    onChange={(e) => {
                        setCategory(e.target.value);
                        setErrors((p) => ({ ...p, category: "" }));
                    }}
                    className="w-full bg-secondary rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-shadow appearance-none cursor-pointer"
                >
                    <option value="" disabled>
                        Select issue category
                    </option>
                    {ISSUE_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                            {c.label}
                        </option>
                    ))}
                </select>
                {errors.category && <p className="text-[10px] text-destructive pl-1">{errors.category}</p>}
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
                    <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="Order ID (optional)"
                        maxLength={100}
                        className="w-full bg-secondary rounded-lg pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                    />
                </div>
            </div>

            <Button type="submit" variant="gradient" size="sm" className="w-full">
                <Send className="w-3.5 h-3.5" />
                Submit & Connect
            </Button>
        </form>
    );
};

export default EscalationForm;
