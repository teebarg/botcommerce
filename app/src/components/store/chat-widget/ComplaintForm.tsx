import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, MessageSquare, Star, CheckCircle } from "lucide-react";

export interface ComplaintData {
    email: string;
    category: string;
    message: string;
    rating: number;
}

interface ComplaintFormProps {
    onSubmit: (data: ComplaintData) => void;
}

const CATEGORIES = ["Product Quality", "Delivery Issue", "Customer Service", "Website/App", "Other"];

const ComplaintForm = ({ onSubmit }: ComplaintFormProps) => {
    const [email, setEmail] = useState("");
    const [category, setCategory] = useState("");
    const [message, setMessage] = useState("");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!email.trim()) errs.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Invalid email";
        if (!category) errs.category = "Please select a category";
        if (!message.trim()) errs.message = "Please describe your experience";
        if (rating === 0) errs.rating = "Please provide a rating";
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
        onSubmit({ email: email.trim(), category, message: message.trim(), rating });
    };

    if (submitted) {
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
                    <p className="text-xs font-semibold text-foreground">Feedback received</p>
                    <p className="text-[11px] text-muted-foreground">Thank you! We take every piece of feedback seriously.</p>
                </div>
            </motion.div>
        );
    }

    const inputClass =
        "w-full bg-secondary rounded-lg pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-shadow";

    return (
        <motion.form
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="mt-2 rounded-xl border border-border bg-card p-3 space-y-2.5"
        >
            <p className="text-xs font-semibold text-foreground">We'd love to hear from you:</p>

            {/* Rating */}
            <div className="space-y-1">
                <p className="text-[11px] text-muted-foreground">How was your experience?</p>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => {
                                setRating(star);
                                setErrors((p) => ({ ...p, rating: "" }));
                            }}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-0.5 transition-transform hover:scale-110"
                        >
                            <Star
                                className={`w-5 h-5 transition-colors ${
                                    star <= (hoverRating || rating) ? "fill-primary text-primary" : "text-muted-foreground/40"
                                }`}
                            />
                        </button>
                    ))}
                </div>
                {errors.rating && <p className="text-[10px] text-destructive pl-1">{errors.rating}</p>}
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
                        className={inputClass}
                    />
                </div>
                {errors.email && <p className="text-[10px] text-destructive pl-1">{errors.email}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1">
                <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => {
                                setCategory(cat);
                                setErrors((p) => ({ ...p, category: "" }));
                            }}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                                category === cat
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-secondary text-muted-foreground border-border hover:border-primary/50"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                {errors.category && <p className="text-[10px] text-destructive pl-1">{errors.category}</p>}
            </div>

            {/* Message */}
            <div className="space-y-1">
                <div className="relative">
                    <MessageSquare className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                    <textarea
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            setErrors((p) => ({ ...p, message: "" }));
                        }}
                        placeholder="Tell us more about your experience..."
                        rows={3}
                        maxLength={1000}
                        className={`${inputClass} resize-none`}
                    />
                </div>
                {errors.message && <p className="text-[10px] text-destructive pl-1">{errors.message}</p>}
            </div>

            <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2 text-xs font-semibold transition-opacity hover:opacity-90"
            >
                <Send className="w-3.5 h-3.5" />
                Submit Feedback
            </motion.button>
        </motion.form>
    );
};

export default ComplaintForm;
