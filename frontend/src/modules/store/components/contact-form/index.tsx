"use client";

import { Input } from "@nextui-org/input";
import { useFormState } from "react-dom";
import { submitContactForm } from "@modules/account/actions";
import { FormButton } from "@modules/common/components/form-button";
import { useEffect, useRef } from "react";
import { useSnackbar } from "notistack";
import { Checkbox } from "@modules/common/components/checkbox";
import { TextArea } from "@modules/common/components/textarea";

const inputClass = {
    inputWrapper: "!bg-white/70 hover:!bg-white/50 focus:!bg-white/50 !text-blue-700",
    label: "!text-black/60 font-semibold text-lg",
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
                <Input required classNames={inputClass} label="Name" name="name" placeholder="Ex. John....." />
                <Input required classNames={inputClass} label="Email" name="email" placeholder="Ex. email@email.com" type="email" />
                <Input classNames={inputClass} label="Phone" name="phone" placeholder="Ex. 09000000000" type="number" />
                <TextArea
                    isRequired
                    description="Your message to us"
                    label="Description"
                    name="message"
                    placeholder="Ex. I want to make an enquiry about..."
                    validationBehavior="native"
                />
                <div className="flex gap-4">
                    <Checkbox defaultSelected name="agreement">
                        <span className="text-gray-700">I allow this website to store my submission.</span>
                    </Checkbox>
                </div>
                <FormButton color="primary" fullWidth={true}>
                    Submit
                </FormButton>
            </div>
        </form>
    );
}
