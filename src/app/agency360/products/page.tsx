"use client";

import "./styles.css";
import { useState, useEffect, useRef } from "react";
import Table from "@cloudscape-design/components/table";

import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";

import Button from "@cloudscape-design/components/button";
import Pagination from "@cloudscape-design/components/pagination";
import ButtonDropdown from "@cloudscape-design/components/button-dropdown";
import { Flashbar, TextFilter } from "@cloudscape-design/components";
import ProductModal from "@/components/product-modal";

interface Product {
  id: string;
  name: string;
  owner: string;
  position: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const API = process.env.NEXT_PUBLIC_API_URL
// API to fetch product data
async function getProducts() {
  const res = await fetch(`${API}/products`);

  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }

  return res.json();
}

export default function ProductsPage() {
  const [flashbarItems, setFlashbarItems] = useState<any[]>([]);
  const [filteringText, setFilteringText] = useState('');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [visible, setVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const pageSize = 10;

  // Form state
  const [formValues, setFormValues] = useState({
    id: '',
    name: '',
    owner: '',
    position: '',
    description: '',
    created_at: '',
    updated_at: ''
  });

  const highlightMatches = (text: string, filteringText: string) => {
    if (!filteringText || !text) return text;

    const regex = new RegExp(`(${filteringText})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? <span key={i} style={{ backgroundColor: '#ffc56d' }}>{part}</span> : part
    );
  };

  // Only render on client side and fetch products
  useEffect(() => {
    setIsMounted(true);

    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        setFlashbarItems([{
          type: "error",
          content: `Error fetching products: ${error}`,
          dismissible: true,
          onDismiss: () => setFlashbarItems([])
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Apply custom styles to modal when it becomes visible
    if (visible && typeof document !== 'undefined') {
      setTimeout(() => {
        const modalElement = document.querySelector('[class*="awsui_dialog"]');
        if (modalElement) {
          (modalElement as HTMLElement).style.marginTop = '0';
          (modalElement as HTMLElement).style.top = '50px';
        }
      }, 0);
    }
  }, [visible, isMounted]);

  // Update form values when selected product changes
  useEffect(() => {
    if (selectedProduct) {
      setFormValues({
        id: selectedProduct.id || '',
        name: selectedProduct.name || '',
        owner: selectedProduct.owner || '',
        position: selectedProduct.position || '',
        description: selectedProduct.description || '',
        created_at: selectedProduct.created_at || '',
        updated_at: selectedProduct.updated_at || ''
      });
    } else {
      // Reset form for new product
      setFormValues({
        id: '',
        name: '',
        owner: '',
        position: '',
        description: '',
        created_at: '',
        updated_at: ''
      });
    }
  }, [selectedProduct]);

  // In your products page
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`${API}/accounts`);
        if (response.ok) {
          const data = await response.json();
          setAccounts(data);
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };
    fetchAccounts();
  }, []);

  // Calculate pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, products.length);
  /* const paginatedProducts = products.slice(startIndex, endIndex);
  const totalPages = Math.ceil(products.length / pageSize); */

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(filteringText.toLowerCase()) ||
    product.owner.toLowerCase().includes(filteringText.toLowerCase()) ||
    product.position.toLowerCase().includes(filteringText.toLowerCase())
  );
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProducts.length / pageSize);


  const handleRowClick = (product: Product) => {
    setSelectedProduct(product);
    setIsEditMode(true);
    setVisible(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsEditMode(false);
    setVisible(true);
  };

  const deleteProduct = async (id: string) => {

    setLoading(true)

    try {
      const response = await fetch(`${API}/product_accounts?product_id=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product accounts');
      }

      const data = await response.json();
      console.log(data);

      // Now you can process the data, for example delete each product account
      for (const account of data) {
        await fetch(`${API}/product_accounts/${account.id}`, {
          method: 'DELETE'
        });
      }

      const delProd = await fetch(`${API}/products/${id}`, {
        method: 'DELETE'
      });

      if (!delProd.ok) {
        throw new Error('Failed to delete product');
      }
      else {
        
        setFlashbarItems([{
          type: "success",
          content: "Product deleted successfully",
          dismissible: true,
          onDismiss: () => setFlashbarItems([])
        }]);
        getProducts().then(data => {setProducts(data); setLoading(false);});
      }


    } catch (error) {
      console.error("Error handling product accounts:", error);
    }
  }




  const handleActionClick = (action: string) => {
    if (selectedItems.length === 0) {

      setFlashbarItems([{
        type: "info",
        content: "Please select at least one product",
        dismissible: true,
        onDismiss: () => setFlashbarItems([])
      }]);
      return;
    } else {
      if (action == "delete") {

        deleteProduct(selectedItems[0].id)

      }
    }

    setFlashbarItems([{
      type: "info",
      content: `${action} action will be performed on ${selectedItems.length} selected products`,
      dismissible: true,
      onDismiss: () => setFlashbarItems([])
    }]);

  };

  const handleSubmitProduct = async (formData: any, selectedAccountIds?: string[]) => {

    try {
      if (isEditMode && selectedProduct) {
        // Update existing product
        const response = await fetch(`${API}/${selectedProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            owner: formData.owner,
            position: formData.position,
            description: formData.description
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update product');
        }

        // Update products array with the modified product
        const updatedProducts = products.map(product =>
          product.id === selectedProduct.id ? {
            ...product,
            name: formData.name,
            owner: formData.owner,
            position: formData.position,
            description: formData.description,
            updated_at: new Date().toISOString()
          } : product
        );

        setProducts(updatedProducts);


        // Update product-account associations if selectedAccountIds is provided
        if (selectedAccountIds && selectedAccountIds.length > 0) {
          // First, get current associations
          const currentAssociationsResponse = await fetch(`${API}/view_product_accounts?product_id=${selectedProduct.id}`);
          if (!currentAssociationsResponse.ok) {
            throw new Error('Failed to fetch current account associations');
          }
          const currentAssociations = await currentAssociationsResponse.json();
          const currentAccountIds = currentAssociations.map((account: any) => account.id);

          // Find accounts to add (in selectedAccountIds but not in currentAccountIds)
          const newAccounts = selectedAccountIds
            .filter((se: any) => se.prod_acct_id === null)
            .map((se: any) => se.id);
          // Add new associations

          for (const accountId of newAccounts) {
            await fetch(`${API}/product_accounts`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                product_id: selectedProduct.id,
                account_id: accountId
              })
            });
          }


          const selAccounts = selectedAccountIds
            .filter((se: any) => se.prod_acct_id != null)
            .map((se: any) => se.prod_acct_id);
          const delAccounts = currentAccountIds.filter((ca: any) => !selAccounts.includes(ca));

          // Remove old associations
          for (const prod_acct_id of delAccounts) {
            await fetch(`${API}/product_accounts/${prod_acct_id}`, {
              method: 'DELETE'
            });
          }
        }
        setFlashbarItems([{
          type: "success",
          content: "Product updated successfully!",
          dismissible: true,
          onDismiss: () => setFlashbarItems([])
        }]);


      } else {
        // Create new product
        const newProduct = {
          name: formData.name,
          owner: formData.owner,
          position: formData.position,
          description: formData.description
        };

        const response = await fetch(`${API}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newProduct)
        });

        if (!response.ok) {
          throw new Error('Failed to create product');
        }

        // Get the created product with ID from response
        const createdProduct = await response.json();

        // Update products array with the new product
        setProducts([...products, createdProduct]);

        // Create product-account associations if selectedAccountIds is provided
        if (selectedAccountIds && selectedAccountIds.length > 0 && createdProduct.id) {
          // Find accounts to add (in selectedAccountIds but not in currentAccountIds)
          const newAccounts = selectedAccountIds
            .filter((se: any) => se.prod_acct_id === null)
            .map((se: any) => se.id);
          for (const accountId of newAccounts) {
            await fetch(`${API}/product_accounts`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                product_id: createdProduct.id,
                account_id: accountId
              })
            });
          }
        }


      }

      setVisible(false);
    } catch (error) {
      console.error("Error submitting product:", error);

      setFlashbarItems([{
        type: "error",
        content: `Error ${isEditMode ? 'updating' : 'creating'} product!`,
        dismissible: true,
        onDismiss: () => setFlashbarItems([])
      }]);
    }
  };


  // Generate skeleton items for loading state
  const skeletonItems = loading ? Array(pageSize).fill({}).map((_, index) => ({
    id: `skeleton-${index}`,
    name: '',
    owner: '',
    position: '',
    description: '',
    created_at: '',
    updated_at: ''
  })) : [];

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
              countText={`${filteredProducts.length} matches`}
            />
          }
          sortingDisabled
          columnDefinitions={[
            {
              id: "name",
              header: "Product Name",
              cell: item => loading ? <div className="skeleton-text"></div> : highlightMatches(item.name, filteringText),
              sortingField: "name"
            },
            {
              id: "owner",
              header: "Owner",
              cell: item => loading ? <div className="skeleton-text"></div> : highlightMatches(item.owner, filteringText),
              sortingField: "owner"
            },
            {
              id: "position",
              header: "Position",
              cell: item => loading ? <div className="skeleton-text"></div> : highlightMatches(item.position, filteringText),
              sortingField: "position"
            },
            {
              id: "created_at",
              header: "Created At",
              cell: item => loading ? <div className="skeleton-text"></div> : new Date(item.created_at).toLocaleDateString(),
              sortingField: "created_at"
            },
            /* {
              id: "accounts",
              header: "Associated Accounts",
              cell: item => {
                if (loading) {
                  return <div className="skeleton-text"></div>;
                }
                return (
                  <Button 
                    variant="link" 
                    onClick={(e) => {
                      e.stopPropagation();
                      fetch(`https://h7z9z3ru7e.execute-api.ap-southeast-1.amazonaws.com/api/view_product_accounts?product_id=${item.id}`)
                        .then(response => response.json())
                        .then(data => {
                          const accountNames = data.map((account: any) => account.account_name).join(", ");
                          alert(`Associated accounts: ${accountNames || "None"}`);
                        })
                        .catch(error => {
                          console.error("Error fetching associated accounts:", error);
                          alert("Error fetching associated accounts");
                        });
                    }}
                  >
                    View Accounts
                  </Button>
                );
              }
            } */
          ]}
          items={loading ? skeletonItems : paginatedProducts}
          loading={false}
          loadingText="Loading products"
          onRowClick={({ detail }) => handleRowClick(detail.item)}
          selectedItems={selectedItems}
          onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
          selectionType="single"
          trackBy="id"
          variant="embedded"
          header={
            <Header
              variant="h1"
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <ButtonDropdown
                    items={[
                      { text: "Delete", id: "delete" }
                    ]}
                    onItemClick={({ detail }) => handleActionClick(detail.id)}
                    disabled={selectedItems.length === 0}
                  >
                    Actions
                  </ButtonDropdown>
                  <Button variant="primary" onClick={handleAddProduct}>
                    Add product
                  </Button>
                </SpaceBetween>
              }
            >
              Manage Products
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
        <ProductModal
          visible={visible}
          onClose={() => setVisible(false)}
          onSubmit={handleSubmitProduct}
          product={selectedProduct}
          isEdit={isEditMode}
          accounts={accounts}
        />
      )}
    </SpaceBetween>
  );
}
