import { Component, OnInit } from '@angular/core';
import { InventoryService, AuditLogEntry } from '../services/inventory.service';
import { Item } from '../models/item.model';

/**
 * ItemManageComponent - Handles CRUD operations for inventory items
 * Allows adding, editing, updating, deleting, importing, exporting items
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

  /** Current mode: 'add', 'edit', 'delete', 'view', 'import', 'export', 'audit' */
  currentMode: 'add' | 'edit' | 'delete' | 'view' | 'import' | 'export' | 'audit' = 'view';

  /** Message to display to user */
  message: { text: string; type: 'success' | 'error' | 'info' | 'warning' } | null = null;

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

  /** Selected items for batch operations */
  selectedItems: Set<string> = new Set();

  /** Whether select all is checked */
  selectAllChecked = false;

  /** Import data */
  importText = '';
  importType: 'json' | 'csv' = 'json';

  /** Export data */
  exportData = '';

  /** Audit log entries */
  auditLog: AuditLogEntry[] = [];

  /** Loading state */
  isLoading = false;

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
  setMode(mode: 'add' | 'edit' | 'delete' | 'view' | 'import' | 'export' | 'audit'): void {
    this.currentMode = mode;
    this.clearMessage();
    this.resetForm();
    this.foundItem = null;
    this.searchName = '';
    this.showConfirmDialog = false;
    this.selectedItems.clear();
    this.selectAllChecked = false;

    if (mode === 'view') {
      this.loadItems();
    } else if (mode === 'export') {
      this.prepareExport();
    } else if (mode === 'audit') {
      this.loadAuditLog();
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
  showMessage(text: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    this.message = { text, type };
    // Auto clear after 5 seconds (longer for warnings)
    const timeout = type === 'warning' ? 8000 : 5000;
    setTimeout(() => this.clearMessage(), timeout);
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

    // Validate ID format (alphanumeric with hyphens/underscores)
    const idPattern = /^[A-Za-z0-9_-]+$/;
    if (!idPattern.test(this.formData.id.trim())) {
      this.showMessage('Item ID must be alphanumeric (hyphens and underscores allowed)', 'error');
      return false;
    }

    return true;
  }

  /**
   * Generate a unique item ID
   */
  generateId(): void {
    const prefix = this.formData.category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.formData.id = `${prefix}-${timestamp}-${random}`;
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
   * Toggle item selection for batch operations
   */
  toggleItemSelection(itemId: string): void {
    if (this.selectedItems.has(itemId)) {
      this.selectedItems.delete(itemId);
    } else {
      this.selectedItems.add(itemId);
    }
  }

  /**
   * Toggle select all items
   */
  toggleSelectAll(): void {
    if (this.selectAllChecked) {
      this.selectedItems.clear();
    } else {
      this.items.forEach(item => this.selectedItems.add(item.id));
    }
    this.selectAllChecked = !this.selectAllChecked;
  }

  /**
   * Get selected items count
   */
  getSelectedCount(): number {
    return this.selectedItems.size;
  }

  /**
   * Batch delete selected items
   */
  batchDeleteSelected(): void {
    if (this.selectedItems.size === 0) {
      this.showMessage('No items selected for deletion', 'warning');
      return;
    }

    const result = this.inventoryService.batchDelete([...this.selectedItems]);

    if (result.deletedCount > 0) {
      this.showMessage(`Successfully deleted ${result.deletedCount} item(s)`, 'success');
      if (result.failedIds.length > 0) {
        this.showMessage(`Failed to delete: ${result.failedIds.join(', ')}`, 'warning');
      }
    } else {
      this.showMessage('Failed to delete items', 'error');
    }

    this.selectedItems.clear();
    this.selectAllChecked = false;
    this.loadItems();
  }

  /**
   * Prepare export data
   */
  prepareExport(): void {
    this.exportData = this.inventoryService.exportAsCSV();
  }

  /**
   * Export as JSON
   */
  exportAsJSON(): void {
    const jsonData = this.inventoryService.exportAsJSON();
    this.downloadFile(jsonData, 'inventory_export.json', 'application/json');
    this.showMessage('Exported as JSON successfully!', 'success');
  }

  /**
   * Export as CSV
   */
  exportAsCSV(): void {
    const csvData = this.inventoryService.exportAsCSV();
    this.downloadFile(csvData, 'inventory_export.csv', 'text/csv');
    this.showMessage('Exported as CSV successfully!', 'success');
  }

  /**
   * Download file helper
   */
  private downloadFile(data: string, filename: string, mimeType: string): void {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Perform import
   */
  performImport(): void {
    if (!this.importText.trim()) {
      this.showMessage('Please paste import data first', 'error');
      return;
    }

    this.isLoading = true;
    let result: { success: boolean; message: string; count: number };

    if (this.importType === 'json') {
      result = this.inventoryService.importFromJSON(this.importText);
    } else {
      result = this.inventoryService.importFromCSV(this.importText);
    }

    this.isLoading = false;

    if (result.success) {
      this.showMessage(result.message, 'success');
      this.importText = '';
      this.loadItems();
    } else {
      this.showMessage(result.message, 'error');
    }
  }

  /**
   * Load audit log
   */
  loadAuditLog(): void {
    this.auditLog = this.inventoryService.getAuditLog(50);
  }

  /**
   * Clear audit log
   */
  clearAuditLog(): void {
    this.inventoryService.clearAuditLog();
    this.auditLog = [];
    this.showMessage('Audit log cleared', 'info');
  }

  /**
   * Format date for audit log
   */
  formatAuditDate(date: Date): string {
    return new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(date));
  }

  /**
   * Get action icon for audit log
   */
  getActionIcon(action: string): string {
    switch (action) {
      case 'ADD': return '➕';
      case 'UPDATE': return '✏️';
      case 'DELETE': return '🗑️';
      case 'IMPORT': return '📥';
      case 'EXPORT': return '📤';
      default: return '📋';
    }
  }

  /**
   * Get action color for audit log
   */
  getActionClass(action: string): string {
    switch (action) {
      case 'ADD': return 'action-add';
      case 'UPDATE': return 'action-update';
      case 'DELETE': return 'action-delete';
      case 'IMPORT': return 'action-import';
      case 'EXPORT': return 'action-export';
      default: return '';
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

  /**
   * Get import placeholder text based on import type
   */
  getImportPlaceholder(): string {
    if (this.importType === 'json') {
      return 'Paste JSON data here...';
    }
    return 'ID,Name,Category,Quantity,Price,Supplier,Stock Status,Popular,Comment\nITEM001,"Item Name",Electronics,10,29.99,"Supplier Name","In Stock",Yes,"Comment"';
  }
}
