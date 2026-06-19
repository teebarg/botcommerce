import { MapPin, Phone, Mail, Clock } from "lucide-react";
import ContactForm from "../contact-form";
import { useConfig } from "@/providers/store-provider";

const contactItems = [
    { icon: MapPin, label: "Visit us", key: "address" as const },
    { icon: Phone, label: "Call us", key: "contact_phone" as const },
    { icon: Mail, label: "Email us", key: "contact_email" as const },
    { icon: Clock, label: "Hours", value: "Mon–Fri 9AM–6PM · Sat 10AM–5PM" },
];

export default function ContactSection() {
    const { config } = useConfig();

    return (
        <section className="py-12 max-w-8xl mx-auto px-4">
            <div className="mb-4">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">Contact</p>
                <h2 className="font-display text-2xl font-semibold">Get in touch</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                        {contactItems.map(({ icon: Icon, label, key, value }) => (
                            <div key={label} className="rounded-xl border border-border bg-card p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
                                </div>
                                <p className="text-sm font-medium text-foreground">
                                    {value ?? (key ? config?.[key] : null)}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-xl border border-border overflow-hidden">
                        <iframe
                            allowFullScreen
                            height="280"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d990.7044697975375!2d3.3243740696178534!3d6.66947613161211!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b96bc12c94145%3A0xce8a5a69dcdc4350!2s8%20Agbado%20Oke%20Aro%20Road%2C%20Ifako-Ijaiye%2C%20Lagos%20101232%2C%20Lagos!5e0!3m2!1sen!2sng!4v1718193637813!5m2!1sen!2sng"
                            style={{ border: 0, display: "block", width: "100%" }}
                            title="Our location"
                        />
                    </div>
                </div>

                <ContactForm />
            </div>
        </section>
    );
}