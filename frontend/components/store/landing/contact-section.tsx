"use client";

import { MapPin, Phone, Mail, Clock } from "lucide-react";

import ContactForm from "../contact-form";

import { useStoreSettings } from "@/providers/store-provider";

export function ContactSection() {
    const { settings } = useStoreSettings();

    return (
        <section className="py-16 bg-content2">
            <div className="max-w-8xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-default-foreground mb-2">Get in Touch</h2>
                    <p className="text-default-600 max-w-2xl mx-auto">
                        {`Have questions about our products or need support? We're here to help. Visit our store or reach out through any of the
                        channels below.`}
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-content1 p-6 rounded-lg border border-divider">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <MapPin className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-default-foreground">Visit Us</h3>
                                </div>
                                <p className="text-default-600 text-sm">
                                    {settings?.address}
                                    <br />
                                    Lagos, Nigeria
                                </p>
                            </div>

                            <div className="bg-content1 p-6 rounded-lg border border-divider">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-secondary/10 rounded-lg">
                                        <Phone className="h-5 w-5 text-secondary" />
                                    </div>
                                    <h3 className="font-semibold text-default-foreground">Call Us</h3>
                                </div>
                                <p className="text-default-600 text-sm">{settings?.contact_phone}</p>
                            </div>

                            <div className="bg-content1 p-6 rounded-lg border border-divider">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-accent/10 rounded-lg">
                                        <Mail className="h-5 w-5 text-accent" />
                                    </div>
                                    <h3 className="font-semibold text-default-foreground">Email Us</h3>
                                </div>
                                <p className="text-default-600 text-sm">{settings?.contact_email}</p>
                            </div>

                            <div className="bg-content1 p-6 rounded-lg border border-divider">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-warning/10 rounded-lg">
                                        <Clock className="h-5 w-5 text-warning" />
                                    </div>
                                    <h3 className="font-semibold text-default-foreground">Hours</h3>
                                </div>
                                <p className="text-default-600 text-sm">
                                    Mon-Fri: 9AM-6PM
                                    <br />
                                    Sat: 10AM-5PM
                                </p>
                            </div>
                        </div>

                        <div className="bg-content1 rounded-lg border border-divider overflow-hidden">
                            <div className="p-4 border-b border-divider">
                                <h3 className="font-semibold text-default-foreground flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    Our Location
                                </h3>
                            </div>
                            <div className="relative h-80">
                                <iframe
                                    allowFullScreen
                                    className="absolute inset-0"
                                    height="100%"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d990.7044697975375!2d3.3243740696178534!3d6.66947613161211!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b96bc12c94145%3A0xce8a5a69dcdc4350!2s8%20Agbado%20Oke%20Aro%20Road%2C%20Ifako-Ijaiye%2C%20Lagos%20101232%2C%20Lagos!5e0!3m2!1sen!2sng!4v1718193637813!5m2!1sen!2sng"
                                    style={{ border: 0 }}
                                    title="Our Location"
                                    width="100%"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <ContactForm />
                </div>
            </div>
        </section>
    );
}
