// src/_lib/components/ProductModal.tsx
import React, { useEffect, useState } from 'react';
import Modal from "@cloudscape-design/components/modal";
import Box from "@cloudscape-design/components/box";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import { FormField, Input, Textarea, TextFilter } from "@cloudscape-design/components";
import Table from "@cloudscape-design/components/table";
import Pagination from "@cloudscape-design/components/pagination";
import Flashbar from "@cloudscape-design/components/flashbar";


interface Product {
    id: string;
    name: string;
    owner: string;
    position: string;
    description: string;
    created_at: string;
    updated_at: string;
}

interface Account {
    id: string;
    account_id: string;
    account_name: string;
    account_email: string;
    account_status: string;
}

interface ProductModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (product: any, selectedAccountIds?: string[]) => Promise<void>;
    product: Product | null;
    isEdit: boolean;
    accounts: Account[]; // Add this prop
}

const API = process.env.NEXT_PUBLIC_API_URL

const ProductModal: React.FC<ProductModalProps> = ({
    visible,
    onClose,
    onSubmit,
    product,
    isEdit,
    accounts

}) => {
    const [formValues, setFormValues] = useState({
        id: '',
        name: '',
        owner: '',
        position: '',
        description: '',
        created_at: '',
        updated_at: ''
    });

    const [linkedAccounts, setLinkedAccounts] = useState<Account[]>([]);
    const [selectedAccountIds, setSelectedAccountIds] = useState<any[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    

    // Fetch linked accounts for this product
    useEffect(() => {
        if (visible && isEdit && product?.id) {
            const fetchLinkedAccounts = async (productId: string) => {
                setLoading(true)
                try {
                    const response = await fetch(`${API}/view_product_accounts?product_id=${productId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setLinkedAccounts(data);

                        // Set selected account IDs based on linked accounts
                        const selected = data.map((e: any) => {
                            return { "id": e.account_id, "prod_acct_id": e.id }
                        })
                        setLoading(false)
                        setSelectedAccountIds(selected);

                    }
                } catch (error) {
                    console.error("Error fetching linked accounts:", error);
                }
            };
            fetchLinkedAccounts(product.id);
        } else {
            // Reset linked accounts when creating a new product
            setLinkedAccounts([]);
            setSelectedAccountIds([]);
        }
    }, [visible, isEdit, product]);

    // Initialize form values when product or visibility changes
    useEffect(() => {
        if (product && isEdit) {
            setFormValues({
                id: product.id || '',
                name: product.name || '',
                owner: product.owner || '',
                position: product.position || '',
                description: product.description || '',
                created_at: product.created_at || '',
                updated_at: product.updated_at || ''
            });
        } else if (!isEdit) {
            setFormValues({
                id: '',
                name: '',
                owner: '',
                position: '',
                description: '',
                created_at: '',
                updated_at: ''
            });

            setTimeout(() => {
                setLoading(false);
            }, 2000);

        }
    }, [product, isEdit, visible]);

    // Add these state variables at the top of your component
    const [filteringText, setFilteringText] = useState('');
    const [filteredAccounts, setFilteredAccounts] = useState<Account[]>(accounts);

    // Add this useEffect to filter accounts when filteringText changes
    useEffect(() => {
        if (!filteringText) {
            setFilteredAccounts(accounts);
        } else {
            const filtered = accounts.filter(account =>
                account.account_name.toLowerCase().includes(filteringText.toLowerCase()) ||
                account.account_email.toLowerCase().includes(filteringText.toLowerCase()) ||
                account.account_status.toLowerCase().includes(filteringText.toLowerCase())
            );
            setFilteredAccounts(filtered);
        }
    }, [filteringText, accounts]);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5; // Number of accounts per page

    //Calculate pagination based on filtered accounts
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredAccounts.length);
    const paginatedAccounts = filteredAccounts.slice(startIndex, endIndex);

    // Create a direct submit handler that doesn't rely on state
    const handleSubmit = async () => {
        // Create a new object with the current input values
        const formData = {
            id: formValues.id,
            name: formValues.name,
            owner: formValues.owner,
            position: formValues.position,
            description: formValues.description,
            created_at: formValues.created_at,
            updated_at: formValues.updated_at
        };
        // Pass the form data and selected account IDs to onSubmit
        try {
            // Pass the form data and selected account IDs to onSubmit
            setIsSubmitting(true);
            await onSubmit(formData, selectedAccountIds);

        } catch (error) {
            // Show error message
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle account selection change

    return (
        <Modal
            visible={visible}
            onDismiss={() => {
                // Do nothing when clicking outside

            }}
            header={<Header variant="h2">{isEdit ? product?.name : 'Create New Product'}</Header>}
            footer={
                <Box float="right">
                    <SpaceBetween direction="horizontal" size="xs">
                        <Button variant="link" onClick={() => { setLoading(true); onClose(); }} disabled={isSubmitting}> 
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
                    <div className="w-48 flex-none"><FormField label="Product Name" description="Name of the product"></FormField></div>
                    <div className="flex-1">
                        {isLoading ? (<div className="skeleton-text"></div>) : (
                            <Input
                                value={formValues.name}
                                onChange={({ detail }) => setFormValues({ ...formValues, name: detail.value })}
                                placeholder="Enter product name"
                                disabled={isSubmitting}
                        />)}
                    </div>
                </div>

                <div className="flex py-4 border-b-1 border-b-gray-100 items-start">
                    <div className="w-48 flex-none"><FormField label="Owner" description="Product owner"></FormField></div>
                    <div className="flex-1">
                        {isLoading ? (<div className="skeleton-text"></div>) : (
                            <Input
                                value={formValues.owner}
                                onChange={({ detail }) => setFormValues({ ...formValues, owner: detail.value })}
                                placeholder="Enter owner name"
                                disabled={isSubmitting}
                        />)}
                    </div>
                </div>
                <div className="flex py-4 border-b-1 border-b-gray-100 items-start">
                    <div className="w-48 flex-none"><FormField label="Position" description="Position or role"></FormField></div>
                    <div className="flex-1">
                        {isLoading ? (<div className="skeleton-text"></div>) : (
                            <Input
                                value={formValues.position}
                                onChange={({ detail }) => setFormValues({ ...formValues, position: detail.value })}
                                placeholder="Enter position"
                                disabled={isSubmitting}
                        />)}
                    </div>
                </div>
                <div className="flex py-4 border-b-1 border-b-gray-100 items-start">
                    <div className="w-48 flex-none"><FormField label="Description" description="Product description"></FormField></div>
                    <div className="flex-1">
                        {isLoading ? (<div className="skeleton-text"></div>) : (
                            <Textarea
                                value={formValues.description}
                                onChange={({ detail }) => setFormValues({ ...formValues, description: detail.value })}
                                placeholder="Enter product description"
                                rows={4}
                                disabled={isSubmitting}
                        />)}
                    </div>
                </div>
                <div className="flex py-4 items-start">
                    <div className="flex-1 overflow-hidden">
                        <Table
                            wrapLines={true}
                            filter={
                                <TextFilter
                                    filteringPlaceholder="Find Accounts"
                                    filteringText={filteringText}
                                    onChange={({ detail }) => setFilteringText(detail.filteringText)}
                                    countText={`${filteredAccounts.length} matches`}
                                />
                            }
                            header={
                                <FormField label="Associated Accounts" description="Select accounts to associate with this product"></FormField>

                            }
                            columnDefinitions={[
                                {
                                    id: "select",
                                    header: "Select",
                                    cell: item => isLoading ? <div className="skeleton-text"></div> : (
                                        <input
                                            type="checkbox"
                                            checked={(() => {
                                                const isSelected = selectedAccountIds.find((e: any) => (item.id == e.id));

                                                if (!isSelected || typeof isSelected !== 'object') {
                                                    return false;
                                                } else {
                                                    return true;
                                                }
                                            })()}

                                            onChange={() => {
                                                // Find if this account is already selected
                                                const existingIndex = selectedAccountIds.findIndex((e: any) => e.id === item.id);

                                                if (existingIndex >= 0) {
                                                    // If found, remove it
                                                    const newSelectedIds = [...selectedAccountIds];
                                                    newSelectedIds.splice(existingIndex, 1);
                                                    setSelectedAccountIds(newSelectedIds);
                                                } else {
                                                    // If not found, add it
                                                    const tSel = { "id": item.id, "prod_acct_id": null };
                                                    setSelectedAccountIds([...selectedAccountIds, tSel]);
                                                }
                                            }}
                                        />
                                    ),
                                    width: 60
                                },
                                {
                                    id: "account_name",
                                    header: "Account Name",
                                    cell: item => isLoading ? <div className="skeleton-text"></div> : item.account_name
                                },
                                {
                                    id: "account_email",
                                    header: "Email",
                                    cell: item => isLoading ? <div className="skeleton-text"></div> : item.account_email
                                },
                                {
                                    id: "account_status",
                                    header: "Status",
                                    cell: item => isLoading ? <div className="skeleton-text"></div> : item.account_status
                                }
                            ]}
                            items={paginatedAccounts}
                            pagination={
                                <Pagination
                                    currentPageIndex={currentPage}
                                    pagesCount={Math.ceil(accounts.length / pageSize)}
                                    onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
                                />
                            }
                            variant="embedded"
                            stickyHeader
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default ProductModal;
