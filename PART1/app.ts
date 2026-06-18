/**
 * PROG2005 - Assignment 2 - Part 1
 * Inventory Management System
 * Author: Yuning Wang
 * Student ID: 24832834
 */

// Type Definitions
type Category = "Electronics" | "Furniture" | "Clothing" | "Tools" | "Miscellaneous";
type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";
type PopularItem = "Yes" | "No";

interface Item {
    itemId: string;
    itemName: string;
    category: Category;
    quantity: number;
    price: number;
    supplierName: string;
    stockStatus: StockStatus;
    popularItem: PopularItem;
    comment: string;
}

// Global Variables
let inventory: Item[] = [];
let editingItemId: string | null = null;

// Initialize with sample data
function initializeData(): void {
    inventory = [
        {
            itemId: "ITM001",
            itemName: "Laptop Dell XPS",
            category: "Electronics",
            quantity: 25,
            price: 1299.99,
            supplierName: "Dell Technologies",
            stockStatus: "In Stock",
            popularItem: "Yes",
            comment: "Business laptop"
        },
        {
            itemId: "ITM002",
            itemName: "Office Chair",
            category: "Furniture",
            quantity: 5,
            price: 299.99,
            supplierName: "Herman Miller",
            stockStatus: "Low Stock",
            popularItem: "Yes",
            comment: ""
        },
        {
            itemId: "ITM003",
            itemName: "Cotton T-Shirt",
            category: "Clothing",
            quantity: 0,
            price: 19.99,
            supplierName: "Textile Co.",
            stockStatus: "Out of Stock",
            popularItem: "No",
            comment: ""
        }
    ];
    showMessage("System initialized with sample data", "info");
    displayAllItems();
}

// Check if item ID exists
function isItemIdExists(itemId: string): boolean {
    return inventory.some(item => item.itemId === itemId);
}

// Validate item data
function validateItem(item: Item, isUpdate: boolean = false): { isValid: boolean; message: string } {
    if (!isUpdate && !item.itemId.trim()) {
        return { isValid: false, message: "Item ID is required" };
    }
    if (!isUpdate && isItemIdExists(item.itemId)) {
        return { isValid: false, message: "Item ID already exists" };
    }
    if (!item.itemName.trim()) {
        return { isValid: false, message: "Item Name is required" };
    }
    if (!item.category) {
        return { isValid: false, message: "Category is required" };
    }
    if (item.quantity < 0) {
        return { isValid: false, message: "Quantity cannot be negative" };
    }
    if (item.price < 0) {
        return { isValid: false, message: "Price cannot be negative" };
    }
    if (!item.supplierName.trim()) {
        return { isValid: false, message: "Supplier Name is required" };
    }
    if (!item.stockStatus) {
        return { isValid: false, message: "Stock Status is required" };
    }
    if (!item.popularItem) {
        return { isValid: false, message: "Popular Item status is required" };
    }
    return { isValid: true, message: "" };
}

// Display message in UI
function showMessage(message: string, type: "success" | "error" | "info"): void {
    const msgDiv = document.getElementById("message") as HTMLDivElement;
    msgDiv.innerHTML = message;
    msgDiv.className = type;
    setTimeout(() => {
        msgDiv.innerHTML = "";
        msgDiv.className = "";
    }, 3000);
}

// Add new item
function addItem(): void {
    const item: Item = {
        itemId: (document.getElementById("itemId") as HTMLInputElement).value.trim(),
        itemName: (document.getElementById("itemName") as HTMLInputElement).value.trim(),
        category: (document.getElementById("category") as HTMLSelectElement).value as Category,
        quantity: parseInt((document.getElementById("quantity") as HTMLInputElement).value) || 0,
        price: parseFloat((document.getElementById("price") as HTMLInputElement).value) || 0,
        supplierName: (document.getElementById("supplierName") as HTMLInputElement).value.trim(),
        stockStatus: (document.getElementById("stockStatus") as HTMLSelectElement).value as StockStatus,
        popularItem: (document.getElementById("popularItem") as HTMLSelectElement).value as PopularItem,
        comment: (document.getElementById("comment") as HTMLTextAreaElement).value
    };

    const validation = validateItem(item, false);
    if (!validation.isValid) {
        showMessage(validation.message, "error");
        return;
    }

    inventory.push(item);
    showMessage(`Item "${item.itemName}" added successfully`, "success");
    clearForm();
    displayAllItems();
}

// Find item by name for update
function findItemToUpdate(): void {
    const searchName = (document.getElementById("updateItemName") as HTMLInputElement).value.trim();
    
    if (!searchName) {
        showMessage("Please enter an item name to search", "error");
        return;
    }

    const item = inventory.find(i => i.itemName.toLowerCase() === searchName.toLowerCase());
    
    if (!item) {
        showMessage(`No item found with name "${searchName}"`, "error");
        return;
    }

    // Load item into form
    (document.getElementById("itemId") as HTMLInputElement).value = item.itemId;
    (document.getElementById("itemId") as HTMLInputElement).disabled = true;
    (document.getElementById("itemName") as HTMLInputElement).value = item.itemName;
    (document.getElementById("category") as HTMLSelectElement).value = item.category;
    (document.getElementById("quantity") as HTMLInputElement).value = item.quantity.toString();
    (document.getElementById("price") as HTMLInputElement).value = item.price.toString();
    (document.getElementById("supplierName") as HTMLInputElement).value = item.supplierName;
    (document.getElementById("stockStatus") as HTMLSelectElement).value = item.stockStatus;
    (document.getElementById("popularItem") as HTMLSelectElement).value = item.popularItem;
    (document.getElementById("comment") as HTMLTextAreaElement).value = item.comment;

    editingItemId = item.itemId;
    
    document.getElementById("addBtn")!.style.display = "none";
    document.getElementById("updateBtn")!.style.display = "inline-block";
    document.getElementById("cancelBtn")!.style.display = "inline-block";
    
    showMessage(`Item "${item.itemName}" loaded for editing`, "info");
}

// Update item
function updateItem(): void {
    if (!editingItemId) {
        showMessage("No item is being edited", "error");
        return;
    }

    const updatedItem: Item = {
        itemId: editingItemId,
        itemName: (document.getElementById("itemName") as HTMLInputElement).value.trim(),
        category: (document.getElementById("category") as HTMLSelectElement).value as Category,
        quantity: parseInt((document.getElementById("quantity") as HTMLInputElement).value) || 0,
        price: parseFloat((document.getElementById("price") as HTMLInputElement).value) || 0,
        supplierName: (document.getElementById("supplierName") as HTMLInputElement).value.trim(),
        stockStatus: (document.getElementById("stockStatus") as HTMLSelectElement).value as StockStatus,
        popularItem: (document.getElementById("popularItem") as HTMLSelectElement).value as PopularItem,
        comment: (document.getElementById("comment") as HTMLTextAreaElement).value
    };

    const validation = validateItem(updatedItem, true);
    if (!validation.isValid) {
        showMessage(validation.message, "error");
        return;
    }

    const index = inventory.findIndex(i => i.itemId === editingItemId);
    if (index !== -1) {
        inventory[index] = updatedItem;
        showMessage(`Item "${updatedItem.itemName}" updated successfully`, "success");
        cancelEdit();
        displayAllItems();
    }
}

// Cancel edit
function cancelEdit(): void {
    clearForm();
    editingItemId = null;
    (document.getElementById("itemId") as HTMLInputElement).disabled = false;
    document.getElementById("addBtn")!.style.display = "inline-block";
    document.getElementById("updateBtn")!.style.display = "none";
    document.getElementById("cancelBtn")!.style.display = "none";
    (document.getElementById("updateItemName") as HTMLInputElement).value = "";
}

// Delete item
function deleteItem(): void {
    const deleteName = (document.getElementById("deleteItemName") as HTMLInputElement).value.trim();
    
    if (!deleteName) {
        showMessage("Please enter an item name to delete", "error");
        return;
    }

    const index = inventory.findIndex(i => i.itemName.toLowerCase() === deleteName.toLowerCase());
    
    if (index === -1) {
        showMessage(`No item found with name "${deleteName}"`, "error");
        return;
    }

    const item = inventory[index]!;
    
    if (confirm(`Delete "${item.itemName}" (ID: ${item.itemId})?`)) {
        inventory.splice(index, 1);
        showMessage(`Item "${deleteName}" deleted successfully`, "success");
        (document.getElementById("deleteItemName") as HTMLInputElement).value = "";
        
        if (editingItemId === item.itemId) {
            cancelEdit();
        }
        
        displayAllItems();
    }
}

// Search items
function searchItems(): void {
    const searchTerm = (document.getElementById("searchName") as HTMLInputElement).value.trim().toLowerCase();
    
    if (!searchTerm) {
        showMessage("Please enter a search term", "error");
        return;
    }

    const results = inventory.filter(item => 
        item.itemName.toLowerCase().includes(searchTerm)
    );

    if (results.length === 0) {
        showMessage(`No items found matching "${searchTerm}"`, "error");
        document.getElementById("output")!.innerHTML = "";
        return;
    }

    showMessage(`Found ${results.length} item(s)`, "success");
    renderItemsTable(results);
}

// Display all items
function displayAllItems(): void {
    if (inventory.length === 0) {
        document.getElementById("output")!.innerHTML = "<p class='no-data'>No items in inventory</p>";
        return;
    }
    renderItemsTable(inventory);
}

// Display popular items
function displayPopularItems(): void {
    const popular = inventory.filter(item => item.popularItem === "Yes");
    
    if (popular.length === 0) {
        document.getElementById("output")!.innerHTML = "<p class='no-data'>No popular items found</p>";
        return;
    }
    
    showMessage(`Found ${popular.length} popular item(s)`, "success");
    renderItemsTable(popular);
}

// Render items table
function renderItemsTable(items: Item[]): void {
    let html = "<table><thead><tr>";
    html += "<th>Item ID</th><th>Item Name</th><th>Category</th>";
    html += "<th>Quantity</th><th>Price</th><th>Supplier</th>";
    html += "<th>Stock Status</th><th>Popular</th><th>Comment</th>";
    html += "</tr></thead><tbody>";

    for (const item of items) {
        html += `<tr>
            <td>${item.itemId}</td>
            <td>${item.itemName}</td>
            <td>${item.category}</td>
            <td>${item.quantity}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>${item.supplierName}</td>
            <td class="${getStatusClass(item.stockStatus)}">${item.stockStatus}</td>
            <td>${item.popularItem}</td>
            <td>${item.comment || "-"}</td>
        </tr>`;
    }

    html += "</tbody></table>";
    document.getElementById("output")!.innerHTML = html;
}

// Get CSS class for stock status
function getStatusClass(status: StockStatus): string {
    switch (status) {
        case "In Stock": return "status-in";
        case "Low Stock": return "status-low";
        case "Out of Stock": return "status-out";
        default: return "";
    }
}

// Clear form
function clearForm(): void {
    (document.getElementById("itemId") as HTMLInputElement).value = "";
    (document.getElementById("itemName") as HTMLInputElement).value = "";
    (document.getElementById("category") as HTMLSelectElement).value = "";
    (document.getElementById("quantity") as HTMLInputElement).value = "";
    (document.getElementById("price") as HTMLInputElement).value = "";
    (document.getElementById("supplierName") as HTMLInputElement).value = "";
    (document.getElementById("stockStatus") as HTMLSelectElement).value = "";
    (document.getElementById("popularItem") as HTMLSelectElement).value = "";
    (document.getElementById("comment") as HTMLTextAreaElement).value = "";
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", initializeData);
