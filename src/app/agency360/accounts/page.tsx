// src/app/agency360/accounts/page.tsx
"use client";

import { useState, useEffect } from "react";
import "./styles.css";
import Table from "@cloudscape-design/components/table";

import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import Pagination from "@cloudscape-design/components/pagination";
import ButtonDropdown from "@cloudscape-design/components/button-dropdown";
import AccountModal from "@/components/account-modal";
import { Flashbar, TextFilter } from "@cloudscape-design/components";


interface Account {
  id: string;
  account_id: string;
  account_name: string;
  account_email: string;
  account_status: string;
  joined_timestamp: string;
  account_arn: string;
  joined_method: string;
}

const API = process.env.NEXT_PUBLIC_API_URL

// API to fetch account data
async function getAccounts() {
  const res = await fetch(`${API}/accounts`);

  if (!res.ok) {
    throw new Error('Failed to fetch accounts');
  }

  return res.json();
}

export default function AccountsPage() {
  const [flashbarItems, setFlashbarItems] = useState<any[]>([]);
  const [filteringText, setFilteringText] = useState('');

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Account[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;

  // Add this before the return statement
  const skeletonItems = loading ? Array(pageSize).fill({}).map((_, index) => ({
    id: `skeleton-${index}`,
    account_id: '',
    account_name: '',
    account_email: '',
    account_status: '',
    joined_timestamp: '',
    account_arn: '',
    joined_method: ''
  })) : [];


  // Only render on client side and fetch accounts
  useEffect(() => {
    setIsMounted(true);
    const fetchAccounts = async () => {
      try {
        const data = await getAccounts();
        setAccounts(data);
      } catch (error) {
        setFlashbarItems([{
          type: "error",
          content: `Error fetching accounts: ${error}`,
          dismissible: true,
          onDismiss: () => setFlashbarItems([])
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  // Calculate pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, accounts.length);
  // Add this after pagination calculation
  const filteredAccounts = accounts.filter(account =>
    account.account_name.toLowerCase().includes(filteringText.toLowerCase()) ||
    account.account_email.toLowerCase().includes(filteringText.toLowerCase()) ||
    account.account_status.toLowerCase().includes(filteringText.toLowerCase())
  );
  const paginatedAccounts = filteredAccounts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredAccounts.length / pageSize);

  const handleRowClick = (account: Account) => {
    setSelectedAccount(account);
    setIsEditMode(true);
    setModalVisible(true);
  };

  const handleAddAccount = () => {
    setSelectedAccount(null);
    setIsEditMode(false);
    setModalVisible(true);
  };

  const handleActionClick = (action: string) => {
    if (selectedItems.length === 0) {
      setFlashbarItems([{
        type: "info",
        content: "Please select at least one Account",
        dismissible: true,
        onDismiss: () => setFlashbarItems([])
      }]);
      return;
    }

    setFlashbarItems([{
      type: "info",
      content: `${action} action will be performed on ${selectedItems.length} selected accounts`,
      dismissible: true,
      onDismiss: () => setFlashbarItems([])
    }]);
  };

  const handleSubmitAccount = async (accountData: any) => {
    try {
      if (isEditMode && selectedAccount) {
        // Update existing account
        const response = await fetch(`${API}/accounts/${selectedAccount.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(accountData)
        });

        if (!response.ok) {
          throw new Error('Failed to update account');
        }

        // Update accounts array with the modified account
        const updatedAccounts = accounts.map(account =>
          account.id === selectedAccount.id ? { ...account, ...accountData } : account
        );

        setAccounts(updatedAccounts);

        setFlashbarItems([{
          type: "success",
          content: "Account updated successfully!",
          dismissible: true,
          onDismiss: () => setFlashbarItems([])
        }]);


      } else {
        // Create new account
        const newAccount = {
          ...accountData,
          joined_timestamp: new Date().toISOString().split('T')[0]
        };

        const response = await fetch(`${API}/api/accounts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newAccount)
        });

        if (!response.ok) {
          throw new Error('Failed to create account');
        }

        // Get the created account with ID from response
        const createdAccount = await response.json();

        // Update accounts array with the new account
        setAccounts([...accounts, createdAccount]);

        setFlashbarItems([{
          type: "success",
          content: "Account created successfully!",
          dismissible: true,
          onDismiss: () => setFlashbarItems([])
        }]);
      }

      setModalVisible(false);
    } catch (error) {
      console.error("Error submitting account:", error);
      setFlashbarItems([{
        type: "error",
        content: `Error ${isEditMode ? 'updating' : 'creating'} account!`,
        dismissible: true,
        onDismiss: () => setFlashbarItems([])
      }]);
    }
  };

  return (
    <SpaceBetween size="l">
      {flashbarItems.length > 0 && (<Flashbar items={flashbarItems} />)}
      {isMounted && (
        <Table
          filter={
            <TextFilter
              filteringPlaceholder="Find accounts"
              filteringText={filteringText}
              onChange={({ detail }) => setFilteringText(detail.filteringText)}
              countText={`${filteredAccounts.length} matches`}
            />
          }
          sortingDisabled
          columnDefinitions={[
            {
              id: "account_name",
              header: "Account Name",
              cell: item => loading ? <div className="skeleton-text"></div> : item.account_name,
              sortingField: "account_name"
            },
            {
              id: "account_email",
              header: "Email",
              cell: item => loading ? <div className="skeleton-text"></div> : item.account_email
            },
            {
              id: "account_status",
              header: "Status",
              cell: item => loading ? <div className="skeleton-text"></div> : item.account_status
            },
            {
              id: "account_arn",
              header: "Account ARN",
              cell: item => loading ? <div className="skeleton-text"></div> : item.account_arn
            },
            {
              id: "joined_method",
              header: "Joined Method",
              cell: item => loading ? <div className="skeleton-text"></div> : item.joined_method
            },
            {
              id: "joined_timestamp",
              header: "Joined Date",
              cell: item => loading ? <div className="skeleton-text"></div> : item.joined_timestamp
            }
          ]}
          items={loading ? skeletonItems : paginatedAccounts}
          loading={false}
          loadingText="Loading accounts"
          onRowClick={({ detail }) => handleRowClick(detail.item)}
          selectedItems={selectedItems}
          onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
          selectionType="single"
          trackBy="id"
          variant="borderless"
          header={
            <Header
              variant="h1"
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  {/* <ButtonDropdown
                    items={[
                      { text: "Delete", id: "delete" },
                      { text: "Activate", id: "activate" },
                      { text: "Deactivate", id: "deactivate" }
                    ]}
                    onItemClick={({ detail }) => handleActionClick(detail.id)}
                    disabled={selectedItems.length === 0}
                  >
                    Actions
                  </ButtonDropdown> */}
                  <Button variant="primary" onClick={handleAddAccount}>
                    Add account
                  </Button>
                </SpaceBetween>
              }
            >
              Manage Account
            </Header>
          }
          pagination={
            <Pagination
              currentPageIndex={currentPage}
              pagesCount={totalPages}
              onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
            />
          }
        />
      )}

      {isMounted && (
        <AccountModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleSubmitAccount}
          account={selectedAccount}
          isEdit={isEditMode}
        />
      )}
    </SpaceBetween>
  );
}
