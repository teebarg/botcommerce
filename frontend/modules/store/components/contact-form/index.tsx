"use client";

import { useFormState } from "react-dom";
import { submitContactForm } from "@modules/account/actions";
import { FormButton } from "@modules/common/components/form-button";
import { useEffect, useRef } from "react";
import { useSnackbar } from "notistack";
import { Input } from "@components/ui/input";
import { TextArea } from "@components/ui/textarea";
import { Checkbox } from "@components/ui/checkbox";

const inputClass = {
    inputWrapper: "!bg-white/70 hover:!bg-white/50 focus:!bg-white/50 !text-blue-700",
    label: "!text-black/50 font-medium text-lg",
    description: "text-black/30 font-medium",
    input: "focus:!bg-transparent !text-gray-600 !bg-transparent",
    innerWrapper: "focus:!bg-white/50",
    base: "focus:!bg-red-500",
};

export default function ContactForm() {
    const { enqueueSnackbar } = useSnackbar();
    const [state, formAction] = useFormState(submitContactForm, { success: false, message: "" });
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state?.message) {
            formRef?.current?.reset(); // Reset the form fields
            enqueueSnackbar(state.message, { variant: state.success ? "success" : "error" });
        }
    }, [state]);

    return (
        <form ref={formRef} action={formAction}>
            <div className="mt-10 space-y-4">
                <Input isRequired classNames={inputClass} label="Name" name="name" placeholder="Ex. John....." />
                <Input isRequired classNames={inputClass} label="Email" name="email" placeholder="Ex. email@email.com" type="email" />
                <Input classNames={inputClass} label="Phone" name="phone" placeholder="Ex. 09000000000" type="number" />
                <TextArea
                    isRequired
                    classNames={inputClass}
                    description="Your message to us"
                    label="Description"
                    name="message"
                    placeholder="Ex. I want to make an enquiry about..."
                    validationBehavior="native"
                />
                <div className="text-gray-800">
                    <Checkbox defaultSelected label="I allow this website to store my submission." name="agreement" />
                </div>
                <FormButton color="primary" fullWidth={true} size="sm" className="min-w-32">
                    Submit
                </FormButton>
            </div>
        </form>
    );
}
