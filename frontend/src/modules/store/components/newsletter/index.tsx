"use client";

import { Input } from "@nextui-org/input";
import { useFormState } from "react-dom";
import { newsletterForm } from "@modules/account/actions";
import { FormButton } from "@modules/common/components/form-button";
import { useEffect, useRef } from "react";
import { MailIcon } from "nui-react-icons";
import { useSnackbar } from "notistack";

export default function NewsletterForm() {
    const { enqueueSnackbar } = useSnackbar();
    const [state, formAction] = useFormState(newsletterForm, { success: false, message: "" });
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state?.message) {
            formRef?.current?.reset(); // Reset the form fields
            enqueueSnackbar(state.message, { variant: state.success ? "success" : "error" });
        }
    }, [state]);

    return (
        <form ref={formRef} action={formAction}>
            <div className="mt-6 sm:flex sm:max-w-lg lg:mt-0">
                <Input
                    name="email"
                    placeholder="email@gmail.com"
                    startContent={<MailIcon className="text-2xl text-default-500 pointer-events-none flex-shrink-0" />}
                    type="email"
                />
                <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                    <FormButton color="secondary" variant="shadow">
                        Subscribe
                    </FormButton>
                </div>
            </div>
        </form>
    );
}
