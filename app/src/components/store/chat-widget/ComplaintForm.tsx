import { useState } from "react";
import { Send, User, Mail, FileText, AlertCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComplaintFormProps {
    onSubmitForm: (formType: string, formData: any) => void;
    isLastMessage: boolean;
}

const COMPLAINT_CATEGORIES = [
    { value: "wrong_item", label: "Wrong Item Received" },
    { value: "delayed_delivery", label: "Delayed Delivery" },
    { value: "damaged_item", label: "Damaged Item" },
    { value: "billing_error", label: "Billing Error" },
    { value: "poor_service", label: "Poor Customer Service" },
    { value: "other", label: "Other" },
];

const ComplaintForm = ({ onSubmitForm, isLastMessage }: ComplaintFormProps) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [orderId, setOrderId] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = "Name is required";
        if (!email.trim()) errs.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Invalid email";
        if (!category) errs.category = "Please select a category";
        if (!description.trim()) errs.description = "Please describe your complaint";
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
        onSubmitForm("complaint_details", {
            name: name.trim(),
            email: email.trim(),
            category,
            description: description.trim(),
            order_number: orderId.trim(),
        });
    };

    if (!isLastMessage || submitted) {
        return null;
    }

    return (
        <form onSubmit={handleSubmit} className="mt-2 rounded-xl border border-border bg-card p-3 space-y-2.5">
            <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                <p className="text-xs font-semibold text-foreground">We're sorry to hear that. Please share the details:</p>
            </div>

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

            {/* Category */}
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
                        Select complaint category
                    </option>
                    {COMPLAINT_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                            {c.label}
                        </option>
                    ))}
                </select>
                {errors.category && <p className="text-[10px] text-destructive pl-1">{errors.category}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1">
                <div className="relative">
                    <FileText className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                    <textarea
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value);
                            setErrors((p) => ({ ...p, description: "" }));
                        }}
                        placeholder="Tell us what happened..."
                        rows={3}
                        maxLength={1000}
                        className="w-full bg-secondary rounded-lg pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-shadow resize-none"
                    />
                </div>
                {errors.description && <p className="text-[10px] text-destructive pl-1">{errors.description}</p>}
            </div>

            {/* Order ID */}
            <div className="space-y-1">
                <div className="relative">
                    <Package className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="Order ID (optional)"
                        maxLength={100}
                        className="w-full bg-secondary rounded-lg pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                    />
                </div>
            </div>

            <Button type="submit" variant="gradient" className="w-full hover:scale-105">
                <Send className="w-3.5 h-3.5" />
                Submit Complaint
            </Button>
        </form>
    );
};

export default ComplaintForm;
