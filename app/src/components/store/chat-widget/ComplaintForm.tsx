import { useState } from "react";
import { Send } from "lucide-react";

type Field = {
    name: string;
    label: string;
    type: "text" | "textarea" | "select";
    required?: boolean;
    placeholder?: string;
    options?: string[];
};

type Props = {
    form: {
        id: string;
        title: string;
        subtitle?: string;
        fields: Field[];
    };
    onSubmit?: (data: Record<string, string>) => void;
    onSubmitForm: (formType: string, formData: any) => void;
};

const ComplaintForm = ({ form, onSubmit, onSubmitForm }: Props) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [summary, setSummary] = useState("");
    const [orderId, setOrderId] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [values, setValues] = useState<Record<string, string>>({});

    function update(name: string, value: string) {
        setValues((v) => ({ ...v, [name]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSubmitForm("complaint", values);
    }

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = "Name is required";
        if (!email.trim()) errs.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Invalid email";
        if (!summary.trim()) errs.summary = "Please describe your issue";
        return errs;
    };

    // const handleSubmit = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     const errs = validate();
    //     if (Object.keys(errs).length > 0) {
    //         setErrors(errs);
    //         return;
    //     }
    //     setSubmitted(true);
    //     onSubmitForm("escalation_details", { name: name.trim(), email: email.trim(), summary: summary.trim(), order_number: orderId.trim() });
    // };

    return (
        <div className="max-w-md rounded-2xl border shadow-sm p-4 space-y-4">
            <div>
                <h3 className="text-sm font-semibold">{form.title}</h3>
                {form.subtitle && <p className="text-xs text-muted-foreground">{form.subtitle}</p>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                {form.fields.map((field) => {
                    if (field.type === "textarea") {
                        return (
                            <div key={field.name} className="space-y-1">
                                <label className="text-xs font-medium">
                                    {field.label}
                                    {field.required && "*"}
                                </label>

                                <textarea
                                    required={field.required}
                                    placeholder={field.placeholder}
                                    className="w-full bg-secondary rounded-lg py-2 px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-shadow resize-none"
                                    rows={3}
                                    onChange={(e) => update(field.name, e.target.value)}
                                />
                            </div>
                        );
                    }

                    if (field.type === "select") {
                        return (
                            <div key={field.name} className="space-y-2">
                                <label className="text-xs font-medium">
                                    {field.label}
                                    {field.required && "*"}
                                </label>

                                <div className="flex flex-wrap gap-2">
                                    {field.options?.map((opt: string) => {
                                        const selected = values[field.name] === opt;

                                        return (
                                            <button
                                                type="button"
                                                key={opt}
                                                onClick={() => update(field.name, opt)}
                                                className={`px-3 py-1.5 rounded-full text-xs border transition
                ${selected ? "bg-primary text-white" : "bg-card"}`}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={field.name} className="space-y-1">
                            <label className="text-xs font-medium">
                                {field.label}
                                {field.required && "*"}
                            </label>

                            <input
                                type="text"
                                required={field.required}
                                placeholder={field.placeholder}
                                className="w-full bg-secondary rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                                onChange={(e) => update(field.name, e.target.value)}
                            />
                        </div>
                    );
                })}

                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2 text-xs font-semibold transition-opacity hover:opacity-90"
                >
                    <Send className="w-3.5 h-3.5" />
                    Submit & Connect
                </button>
            </form>
        </div>
    );
};

export default ComplaintForm;
