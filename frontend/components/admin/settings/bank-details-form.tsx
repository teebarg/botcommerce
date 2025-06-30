import React, { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/apis/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BankDetails } from "@/schemas";

interface BankDetailsFormProps {
    onClose: () => void;
}

const BankDetailsForm: React.FC<BankDetailsFormProps> = ({ onClose }) => {
    const [formData, setFormData] = useState<Record<string, any>>({
        bank_name: "",
        account_name: "",
        account_number: "",
    });
    const queryClient = useQueryClient();

    const { mutate: createBankDetails, isPending } = useMutation({
        mutationFn: async (input: { bank_name: string; account_name: string; account_number: string }) =>
            await api.post<BankDetails>("/bank-details/", input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bank-details"] });
            toast.success("Bank details added successfully");
            onClose();
            setFormData({
                bank_name: "",
                account_name: "",
                account_number: "",
            });
        },
        onError: () => {
            toast.error("Failed to add bank details");
        },
    });

    const handleAddBankDetails = async () => {
        createBankDetails({
            bank_name: formData.bank_name,
            account_name: formData.account_name,
            account_number: formData.account_number,
        });
    };

    return (
        <div className="px-2 md:px-4 py-8">
            <h2 className="text-2xl font-semibold mb-4">Add Bank Details</h2>
            <form>
                <div className="space-y-4">
                    <Input
                        label="Bank Name"
                        placeholder="Enter bank name"
                        value={formData.bank_name}
                        onChange={(newValue) => setFormData((prev) => ({ ...prev, bank_name: newValue.target.value }))}
                    />
                    <Input
                        label="Account Name"
                        placeholder="Enter account name"
                        value={formData.account_name}
                        onChange={(newValue) => setFormData((prev) => ({ ...prev, account_name: newValue.target.value }))}
                    />
                    <Input
                        label="Account Number"
                        placeholder="Enter account number"
                        type="number"
                        value={formData.account_number}
                        onChange={(newValue) => setFormData((prev) => ({ ...prev, account_number: newValue.target.value }))}
                    />
                </div>
                <div className="flex-row justify-end space-x-2">
                    <Button aria-label="close" className="min-w-36" variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button aria-label="delete" className="min-w-36" isLoading={isPending} variant="primary" onClick={handleAddBankDetails}>
                        Submit
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default BankDetailsForm;
