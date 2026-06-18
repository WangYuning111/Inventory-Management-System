import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../services/inventory.service';
import { Item } from '../models/item.model';

/**
 * ItemManageComponent - Handles CRUD operations for inventory items
 * Allows adding, editing, updating, and deleting items
 */
@Component({
  selector: 'app-item-manage',
  standalone: false,
  templateUrl: './item-manage.component.html',
  styleUrl: './item-manage.component.css'
})
export class ItemManageComponent implements OnInit {
  /** All items in inventory */
  items: Item[] = [];
  
  /** Categories available for selection */
  categories = ['Electronics', 'Furniture', 'Clothing', 'Tools', 'Miscellaneous'];
  
  /** Current mode: 'add', 'edit', 'delete', 'view' */
  currentMode: 'add' | 'edit' | 'delete' | 'view' = 'view';
  
  /** Message to display to user */
  message: { text: string; type: 'success' | 'error' | 'info' } | null = null;
  
  /** Form data for add/edit */
  formData = {
    id: '',
    name: '',
    category: 'Electronics',
    quantity: 0,
    price: 0,
    supplierName: '',
    isPopular: false,
    comment: ''
  };
  
  /** Search term for finding item to edit/delete */
  searchName = '';
  
  /** Found item for editing/deleting */
  foundItem: Item | null = null;
  
  /** Whether to show confirmation dialog */
  showConfirmDialog = false;

  constructor(private inventoryService: InventoryService) {}

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.loadItems();
  }

  /**
   * Load all items from service
   */
  loadItems(): void {
    this.items = this.inventoryService.getAllItems();
  }

  /**
   * Set current mode
   */
  setMode(mode: 'add' | 'edit' | 'delete' | 'view'): void {
    this.currentMode = mode;
    this.clearMessage();
    this.resetForm();
    this.foundItem = null;
    this.searchName = '';
    this.showConfirmDialog = false;
    
    if (mode === 'view') {
      this.loadItems();
    }
  }

  /**
   * Reset form to default values
   */
  resetForm(): void {
    this.formData = {
      id: '',
      name: '',
      category: 'Electronics',
      quantity: 0,
      price: 0,
      supplierName: '',
      isPopular: false,
      comment: ''
    };
  }

  /**
   * Clear message
   */
  clearMessage(): void {
    this.message = null;
  }

  /**
   * Show message to user
   */
  showMessage(text: string, type: 'success' | 'error' | 'info'): void {
    this.message = { text, type };
    // Auto clear after 5 seconds
    setTimeout(() => this.clearMessage(), 5000);
  }

  /**
   * Validate form data
   */
  validateForm(): boolean {
    // Check required fields
    if (!this.formData.id?.trim()) {
      this.showMessage('Item ID is required', 'error');
      return false;
    }
    if (!this.formData.name?.trim()) {
      this.showMessage('Item Name is required', 'error');
      return false;
    }
    if (!this.formData.category) {
      this.showMessage('Category is required', 'error');
      return false;
    }
    if (this.formData.quantity === null || this.formData.quantity === undefined) {
      this.showMessage('Quantity is required', 'error');
      return false;
    }
    if (this.formData.price === null || this.formData.price === undefined) {
      this.showMessage('Price is required', 'error');
      return false;
    }
    if (!this.formData.supplierName?.trim()) {
      this.showMessage('Supplier Name is required', 'error');
      return false;
    }

    // Validate numeric fields
    if (isNaN(this.formData.quantity) || this.formData.quantity < 0) {
      this.showMessage('Quantity must be a non-negative number', 'error');
      return false;
    }
    if (isNaN(this.formData.price) || this.formData.price < 0) {
      this.showMessage('Price must be a non-negative number', 'error');
      return false;
    }

    return true;
  }

  /**
   * Add new item
   */
  addItem(): void {
    if (!this.validateForm()) {
      return;
    }

    // Check if ID already exists
    if (this.inventoryService.itemIdExists(this.formData.id)) {
      this.showMessage(`Item ID "${this.formData.id}" already exists. ID must be unique.`, 'error');
      return;
    }

    const success = this.inventoryService.addItem({
      id: this.formData.id.trim(),
      name: this.formData.name.trim(),
      category: this.formData.category as Item['category'],
      quantity: Number(this.formData.quantity),
      price: Number(this.formData.price),
      supplierName: this.formData.supplierName.trim(),
      isPopular: this.formData.isPopular,
      comment: this.formData.comment?.trim() || undefined
    });

    if (success) {
      this.showMessage(`Item "${this.formData.name}" added successfully!`, 'success');
      this.resetForm();
      this.loadItems();
    } else {
      this.showMessage('Failed to add item. ID may already exist.', 'error');
    }
  }

  /**
   * Search for item by name (for edit/delete)
   */
  searchItem(): void {
    if (!this.searchName.trim()) {
      this.showMessage('Please enter an item name to search', 'error');
      return;
    }

    this.foundItem = this.inventoryService.getItemByName(this.searchName.trim()) || null;
    
    if (this.foundItem) {
      if (this.currentMode === 'edit') {
        // Populate form with found item data
        this.formData = {
          id: this.foundItem.id,
          name: this.foundItem.name,
          category: this.foundItem.category,
          quantity: this.foundItem.quantity,
          price: this.foundItem.price,
          supplierName: this.foundItem.supplierName,
          isPopular: this.foundItem.isPopular,
          comment: this.foundItem.comment || ''
        };
      }
      this.showMessage(`Found item: "${this.foundItem.name}"`, 'success');
    } else {
      this.showMessage(`No item found with name: "${this.searchName}"`, 'error');
    }
  }

  /**
   * Update existing item
   */
  updateItem(): void {
    if (!this.foundItem) {
      this.showMessage('Please search for an item first', 'error');
      return;
    }

    // Validate required fields
    if (!this.formData.name?.trim()) {
      this.showMessage('Item Name is required', 'error');
      return;
    }
    if (!this.formData.category) {
      this.showMessage('Category is required', 'error');
      return;
    }
    if (this.formData.quantity === null || isNaN(this.formData.quantity) || this.formData.quantity < 0) {
      this.showMessage('Quantity must be a non-negative number', 'error');
      return;
    }
    if (this.formData.price === null || isNaN(this.formData.price) || this.formData.price < 0) {
      this.showMessage('Price must be a non-negative number', 'error');
      return;
    }
    if (!this.formData.supplierName?.trim()) {
      this.showMessage('Supplier Name is required', 'error');
      return;
    }

    const success = this.inventoryService.updateItemByName(this.foundItem.name, {
      name: this.formData.name.trim(),
      category: this.formData.category as Item['category'],
      quantity: Number(this.formData.quantity),
      price: Number(this.formData.price),
      supplierName: this.formData.supplierName.trim(),
      isPopular: this.formData.isPopular,
      comment: this.formData.comment?.trim() || undefined
    });

    if (success) {
      this.showMessage(`Item "${this.formData.name}" updated successfully!`, 'success');
      this.resetForm();
      this.foundItem = null;
      this.searchName = '';
      this.loadItems();
    } else {
      this.showMessage('Failed to update item', 'error');
    }
  }

  /**
   * Show delete confirmation
   */
  confirmDelete(): void {
    if (!this.foundItem) {
      this.showMessage('Please search for an item first', 'error');
      return;
    }
    this.showConfirmDialog = true;
  }

  /**
   * Cancel delete
   */
  cancelDelete(): void {
    this.showConfirmDialog = false;
  }

  /**
   * Delete item after confirmation
   */
  deleteItem(): void {
    if (!this.foundItem) {
      return;
    }

    const success = this.inventoryService.deleteItemByName(this.foundItem.name);

    if (success) {
      this.showMessage(`Item "${this.foundItem.name}" deleted successfully!`, 'success');
      this.foundItem = null;
      this.searchName = '';
      this.showConfirmDialog = false;
      this.loadItems();
    } else {
      this.showMessage('Failed to delete item', 'error');
    }
  }

  /**
   * Get stock status CSS class
   */
  getStockClass(status: string): string {
    switch (status) {
      case 'In Stock': return 'status-in-stock';
      case 'Low Stock': return 'status-low-stock';
      case 'Out of Stock': return 'status-out-of-stock';
      default: return '';
    }
  }

  /**
   * Format currency
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(value);
  }
}
