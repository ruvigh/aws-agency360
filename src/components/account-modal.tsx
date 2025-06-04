// src/_lib/components/AccountModal.tsx
import React, { useEffect, useState } from 'react';
import Modal from "@cloudscape-design/components/modal";
import Box from "@cloudscape-design/components/box";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import { FormField, Input, Select } from "@cloudscape-design/components";

interface Account {
    id?: string;
    account_id: string;
    account_name: string;
    account_email: string;
    account_status: string;
    joined_timestamp?: string;
    account_arn: string;
    joined_method: string;
}

interface AccountModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (account: Account) => Promise<void>;
    account: Account | null;
    isEdit: boolean;
}

const AccountModal: React.FC<AccountModalProps> = ({
    visible,
    onClose,
    onSubmit,
    account,
    isEdit
}) => {
    const [formValues, setFormValues] = useState<Account>({
        account_id: '',
        account_name: '',
        account_email: '',
        account_status: 'Active',
        account_arn: '',
        joined_method: 'Invitation'
    });

    const [isLoading, setLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (account && isEdit) {
            setFormValues({
                id: account.id,
                account_id: account.account_id || '',
                account_name: account.account_name || '',
                account_email: account.account_email || '',
                account_status: account.account_status || 'Active',
                joined_timestamp: account.joined_timestamp,
                account_arn: account.account_arn || '',
                joined_method: account.joined_method || 'Invitation'
            });
        } else {
            
            // Reset form for new account
            setFormValues({
                account_id: '',
                account_name: '',
                account_email: '',
                account_status: 'Active',
                account_arn: '',
                joined_method: 'Invitation'
            });
        }

        setTimeout(() => {
                setLoading(false);
            }, 2000);

    }, [account, isEdit, visible]);

        const handleSubmit = async () => {
            try {
            // Pass the form data and selected account IDs to onSubmit
                setIsSubmitting(true);
                await onSubmit(formValues);

            } catch (error) {
                console.error("Error submitting form:", error);

            } finally {
                setIsSubmitting(false);
            }
            
        };

    return (
        <Modal
            visible={visible}
            onDismiss={() => {
                // Do nothing when clicking outside
            }}
            header={<Header variant="h2">{isEdit ? account?.account_name : 'Create New Account'}</Header>}
            footer={
                <Box float="right">
                    <SpaceBetween direction="horizontal" size="xs">
                        <Button variant="link" onClick={() => {setLoading(true);onClose();}} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSubmit} loading={isSubmitting}>
                            {isEdit ? 'Save' : 'Create'}
                        </Button>

                    </SpaceBetween>
                </Box>
            }
            size="large"
        >
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div className="flex py-4 border-b-1 border-b-gray-100 items-start">
                    <div className="w-48 flex-none"><FormField label="Account ID" description="Unique identifier"></FormField></div>
                    <div className="flex-1">
                        {isLoading ? (<div className="skeleton-text"></div>) :(
                            <Input
                                value={formValues.account_id}
                                onChange={({ detail }) => setFormValues({ ...formValues, account_id: detail.value })}
                                readOnly={isEdit}
                                placeholder={isEdit ? '' : "Enter account ID (optional)"}
                                disabled={isSubmitting}
                            />
                        )}
                    </div>
                </div>
                <div className="flex py-4 border-b-1 border-b-gray-100 items-start">
                    <div className="w-48 flex-none"><FormField label="Account Name" description="Name of the account"></FormField></div>
                    <div className="flex-1">
                        {isLoading ? (<div className="skeleton-text"></div>) :(
                            <Input
                                value={formValues.account_name}
                                onChange={({ detail }) => setFormValues({ ...formValues, account_name: detail.value })}
                                placeholder={isEdit ? '' : "Enter account name"}
                                disabled={isSubmitting}
                            />
                        )}
                    </div>
                </div>
                <div className="flex py-4 border-b-1 border-b-gray-100 items-start">
                    <div className="w-48 flex-none"><FormField label="Account ARN" description="Name of the account"></FormField></div>
                    <div className="flex-1">
                        {isLoading ? (<div className="skeleton-text"></div>) :(
                            <Input
                                value={formValues.account_arn}
                                onChange={({ detail }) => setFormValues({ ...formValues, account_arn: detail.value })}
                                placeholder={isEdit ? '' : "Enter Account ARN"}
                                disabled={isSubmitting}
                            />
                        )}
                    </div>
                </div>
                <div className="flex py-4 border-b-1 border-b-gray-100 items-start">
                    <div className="w-48 flex-none"><FormField label="Joined Method " description="How did they join this organization?"></FormField></div>
                    <div className="flex-1">
                        {isLoading ? (<div className="skeleton-text"></div>) :(
                            <Select
                                selectedOption={
                                    formValues.joined_method
                                        ? { label: formValues.joined_method, value: formValues.joined_method }
                                        : { label: "INVITED", value: "INVITED" }
                                }
                                options={[
                                    { label: "INVITED", value: "INVITED" },
                                    { label: "SELF", value: "SELF" }
                                ]}
                                onChange={({ detail }) =>
                                    setFormValues({
                                        ...formValues,
                                        joined_method: detail.selectedOption?.value || "INVITED"
                                    })
                                }
                                disabled={isSubmitting}
                            />
                        )}
                    </div>
                </div>
                <div className="flex py-4 border-b-1 border-b-gray-100 items-start">
                    <div className="w-48 flex-none"><FormField label="Email" description="Contact email"></FormField></div>
                    <div className="flex-1">
                        {isLoading ? (<div className="skeleton-text"></div>) :(
                            <Input
                                value={formValues.account_email}
                                type="email"
                                onChange={({ detail }) => setFormValues({ ...formValues, account_email: detail.value })}
                                placeholder={isEdit ? '' : "Enter email address"}
                                disabled={isSubmitting}
                            />
                        )}
                    </div>
                </div>
                <div className="flex py-4 border-b-1 border-b-gray-100 items-start">
                    <div className="w-48 flex-none"><FormField label="Status" description="Account status"></FormField></div>
                    <div className="flex-1">
                        {isLoading ? (<div className="skeleton-text"></div>) :(
                            <Select
                                selectedOption={
                                    formValues.account_status
                                        ? { label: formValues.account_status, value: formValues.account_status }
                                        : { label: "Active", value: "Active" }
                                }
                                options={[
                                    { label: "Active", value: "Active" },
                                    { label: "Inactive", value: "Inactive" }
                                ]}
                                onChange={({ detail }) =>
                                    setFormValues({
                                        ...formValues,
                                        account_status: detail.selectedOption?.value || "Active"
                                    })
                                }
                                disabled={isSubmitting}
                            />
                        )}
                    </div>
                </div>
                <div className="flex py-4 border-b-1 border-b-gray-100 items-start">
                    <div className="w-48 flex-none"><FormField label="Joined Date" description="Date account was created"></FormField></div>
                    <div className="flex-1">
                        {isLoading ? (<div className="skeleton-text"></div>) :(
                            <Input
                                value={formValues.joined_timestamp || ''}
                                readOnly
                                disabled={isSubmitting}
                            />
                        )}
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default AccountModal;
