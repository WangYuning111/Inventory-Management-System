import { Injectable } from '@angular/core';
import { Item, INITIAL_ITEMS, calculateStockStatus } from '../models/item.model';

/**
 * AuditLogEntry - Records all inventory changes for tracking
 */
export interface AuditLogEntry {
  timestamp: Date;
  action: 'ADD' | 'UPDATE' | 'DELETE' | 'IMPORT' | 'EXPORT';
  itemId: string;
  itemName: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

/**
 * InventoryService - Manages all inventory data operations
 * Provides CRUD operations, search functionality, data persistence, and audit logging
 */
@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  /** Array storing all inventory items */
  private items: Item[] = [];

  /** Audit log for tracking changes */
  private auditLog: AuditLogEntry[] = [];

  /** Low stock threshold configuration */
  private lowStockThreshold = 5;

  /** Storage keys */
  private readonly STORAGE_KEY = 'inventory_items';
  private readonly AUDIT_KEY = 'inventory_audit_log';
  private readonly SETTINGS_KEY = 'inventory_settings';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load data from localStorage
   */
  private loadFromStorage(): void {
    try {
      // Load items
      const storedItems = localStorage.getItem(this.STORAGE_KEY);
      if (storedItems) {
        this.items = JSON.parse(storedItems);
      } else {
        this.items = [...INITIAL_ITEMS];
        this.saveToStorage();
      }

      // Load audit log
      const storedAudit = localStorage.getItem(this.AUDIT_KEY);
      if (storedAudit) {
        const parsed = JSON.parse(storedAudit);
        this.auditLog = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
      }

      // Load settings
      const storedSettings = localStorage.getItem(this.SETTINGS_KEY);
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        this.lowStockThreshold = settings.lowStockThreshold || 5;
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
      this.items = [...INITIAL_ITEMS];
      this.saveToStorage();
    }
  }

  /**
   * Save items to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  /**
   * Save audit log to localStorage
   */
  private saveAuditLog(): void {
    try {
      // Keep only last 100 entries
      const logsToSave = this.auditLog.slice(-100);
      localStorage.setItem(this.AUDIT_KEY, JSON.stringify(logsToSave));
    } catch (error) {
      console.error('Error saving audit log:', error);
    }
  }

  /**
   * Add audit log entry
   */
  private addAuditEntry(
    action: AuditLogEntry['action'],
    itemId: string,
    itemName: string,
    details: string,
    previousValue?: string,
    newValue?: string
  ): void {
    const entry: AuditLogEntry = {
      timestamp: new Date(),
      action,
      itemId,
      itemName,
      details,
      previousValue,
      newValue
    };
    this.auditLog.push(entry);
    this.saveAuditLog();
  }

  /**
   * Get all items in the inventory
   */
  getAllItems(): Item[] {
    return [...this.items];
  }

  /**
   * Get only popular items
   */
  getPopularItems(): Item[] {
    return this.items.filter(item => item.isPopular);
  }

  /**
   * Get low stock items
   */
  getLowStockItems(): Item[] {
    return this.items.filter(item => item.stockStatus === 'Low Stock');
  }

  /**
   * Get out of stock items
   */
  getOutOfStockItems(): Item[] {
    return this.items.filter(item => item.stockStatus === 'Out of Stock');
  }

  /**
   * Get item by ID
   */
  getItemById(id: string): Item | undefined {
    return this.items.find(item => item.id === id);
  }

  /**
   * Get item by name
   */
  getItemByName(name: string): Item | undefined {
    return this.items.find(item =>
      item.name.toLowerCase() === name.toLowerCase()
    );
  }

  /**
   * Check if item ID already exists
   */
  itemIdExists(id: string): boolean {
    return this.items.some(item => item.id === id);
  }

  /**
   * Check if item name already exists
   */
  itemNameExists(name: string): boolean {
    return this.items.some(item =>
      item.name.toLowerCase() === name.toLowerCase()
    );
  }

  /**
   * Add a new item to the inventory
   */
  addItem(item: Omit<Item, 'stockStatus'>): boolean {
    // Validate: ID must be unique
    if (this.itemIdExists(item.id)) {
      return false;
    }

    // Calculate stock status based on quantity
    const stockStatus = calculateStockStatus(item.quantity);

    const newItem: Item = {
      ...item,
      stockStatus
    };

    this.items.push(newItem);
    this.saveToStorage();

    // Add audit log
    this.addAuditEntry(
      'ADD',
      newItem.id,
      newItem.name,
      `Added new item in ${newItem.category} category`,
      undefined,
      `Qty: ${newItem.quantity}, Price: $${newItem.price}`
    );

    return true;
  }

  /**
   * Update an existing item by name
   */
  updateItemByName(name: string, updates: Partial<Omit<Item, 'id' | 'stockStatus'>>): boolean {
    const index = this.items.findIndex(item =>
      item.name.toLowerCase() === name.toLowerCase()
    );

    if (index === -1) {
      return false;
    }

    const oldItem = { ...this.items[index] };

    // Update the item
    this.items[index] = {
      ...this.items[index],
      ...updates
    };

    // Recalculate stock status if quantity changed
    if (updates.quantity !== undefined) {
      this.items[index].stockStatus = calculateStockStatus(updates.quantity);
    }

    this.saveToStorage();

    // Add audit log
    const changes: string[] = [];
    if (updates.name && updates.name !== oldItem.name) {
      changes.push(`Name: ${oldItem.name} → ${updates.name}`);
    }
    if (updates.quantity !== undefined && updates.quantity !== oldItem.quantity) {
      changes.push(`Quantity: ${oldItem.quantity} → ${updates.quantity}`);
    }
    if (updates.price !== undefined && updates.price !== oldItem.price) {
      changes.push(`Price: $${oldItem.price} → $${updates.price}`);
    }
    if (updates.category && updates.category !== oldItem.category) {
      changes.push(`Category: ${oldItem.category} → ${updates.category}`);
    }
    if (updates.isPopular !== undefined && updates.isPopular !== oldItem.isPopular) {
      changes.push(`Popular: ${oldItem.isPopular} → ${updates.isPopular}`);
    }

    this.addAuditEntry(
      'UPDATE',
      oldItem.id,
      oldItem.name,
      `Updated: ${changes.join(', ') || 'no changes'}`
    );

    return true;
  }

  /**
   * Delete an item by name
   */
  deleteItemByName(name: string): boolean {
    const index = this.items.findIndex(item =>
      item.name.toLowerCase() === name.toLowerCase()
    );

    if (index === -1) {
      return false;
    }

    const deletedItem = this.items[index];
    this.items.splice(index, 1);
    this.saveToStorage();

    // Add audit log
    this.addAuditEntry(
      'DELETE',
      deletedItem.id,
      deletedItem.name,
      `Deleted item from ${deletedItem.category} category`,
      `Qty: ${deletedItem.quantity}, Price: $${deletedItem.price}`,
      undefined
    );

    return true;
  }

  /**
   * Search items by name (partial match)
   */
  searchItemsByName(searchTerm: string): Item[] {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      return this.getAllItems();
    }

    return this.items.filter(item =>
      item.name.toLowerCase().includes(term)
    );
  }

  /**
   * Search with advanced filters
   */
  advancedSearch(params: {
    name?: string;
    category?: string;
    stockStatus?: string;
    minPrice?: number;
    maxPrice?: number;
    minQuantity?: number;
    maxQuantity?: number;
    supplier?: string;
    isPopular?: boolean;
  }): Item[] {
    let results = [...this.items];

    if (params.name) {
      const term = params.name.toLowerCase();
      results = results.filter(item => item.name.toLowerCase().includes(term));
    }

    if (params.category && params.category !== 'All') {
      results = results.filter(item => item.category === params.category);
    }

    if (params.stockStatus && params.stockStatus !== 'All') {
      results = results.filter(item => item.stockStatus === params.stockStatus);
    }

    if (params.minPrice !== undefined) {
      results = results.filter(item => item.price >= params.minPrice!);
    }

    if (params.maxPrice !== undefined) {
      results = results.filter(item => item.price <= params.maxPrice!);
    }

    if (params.minQuantity !== undefined) {
      results = results.filter(item => item.quantity >= params.minQuantity!);
    }

    if (params.maxQuantity !== undefined) {
      results = results.filter(item => item.quantity <= params.maxQuantity!);
    }

    if (params.supplier) {
      const term = params.supplier.toLowerCase();
      results = results.filter(item => item.supplierName.toLowerCase().includes(term));
    }

    if (params.isPopular !== undefined) {
      results = results.filter(item => item.isPopular === params.isPopular);
    }

    return results;
  }

  /**
   * Get inventory statistics
   */
  getStatistics(): {
    totalItems: number;
    totalStock: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    popularItems: number;
    totalValue: number;
    lowStockThreshold: number;
  } {
    return {
      totalItems: this.items.length,
      totalStock: this.items.reduce((sum, item) => sum + item.quantity, 0),
      inStock: this.items.filter(item => item.stockStatus === 'In Stock').length,
      lowStock: this.items.filter(item => item.stockStatus === 'Low Stock').length,
      outOfStock: this.items.filter(item => item.stockStatus === 'Out of Stock').length,
      popularItems: this.items.filter(item => item.isPopular).length,
      totalValue: this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      lowStockThreshold: this.lowStockThreshold
    };
  }

  /**
   * Set low stock threshold
   */
  setLowStockThreshold(threshold: number): void {
    this.lowStockThreshold = threshold;
    this.saveSettings();
  }

  /**
   * Get unique suppliers list
   */
  getUniqueSuppliers(): string[] {
    const suppliers = new Set<string>();
    this.items.forEach(item => {
      if (item.supplierName) {
        suppliers.add(item.supplierName);
      }
    });
    return Array.from(suppliers).sort();
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify({
        lowStockThreshold: this.lowStockThreshold
      }));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  /**
   * Get audit log
   */
  getAuditLog(limit: number = 50): AuditLogEntry[] {
    return this.auditLog.slice(-limit).reverse();
  }

  /**
   * Clear audit log
   */
  clearAuditLog(): void {
    this.auditLog = [];
    this.saveAuditLog();
  }

  /**
   * Export inventory as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      items: this.items,
      statistics: this.getStatistics()
    }, null, 2);
  }

  /**
   * Export inventory as CSV
   */
  exportAsCSV(): string {
    const headers = ['ID', 'Name', 'Category', 'Quantity', 'Price', 'Supplier', 'Stock Status', 'Popular', 'Comment'];
    const rows = this.items.map(item => [
      item.id,
      `"${item.name}"`,
      item.category,
      item.quantity,
      item.price,
      `"${item.supplierName}"`,
      item.stockStatus,
      item.isPopular ? 'Yes' : 'No',
      `"${item.comment || ''}"`
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Import inventory from JSON
   */
  importFromJSON(jsonString: string): { success: boolean; message: string; count: number } {
    try {
      const data = JSON.parse(jsonString);
      let importedItems: Item[] = [];

      if (Array.isArray(data)) {
        importedItems = data;
      } else if (data.items && Array.isArray(data.items)) {
        importedItems = data.items;
      } else {
        return { success: false, message: 'Invalid JSON format', count: 0 };
      }

      // Validate and recalculate stock status
      let validCount = 0;
      for (const item of importedItems) {
        if (item.id && item.name && item.category && item.quantity !== undefined && item.price !== undefined) {
          item.stockStatus = calculateStockStatus(item.quantity);
          validCount++;
        }
      }

      if (validCount === 0) {
        return { success: false, message: 'No valid items found in import data', count: 0 };
      }

      this.items = importedItems;
      this.saveToStorage();

      this.addAuditEntry(
        'IMPORT',
        'BATCH',
        `${validCount} items`,
        `Imported ${validCount} items from JSON`
      );

      return { success: true, message: `Successfully imported ${validCount} items`, count: validCount };
    } catch (error) {
      return { success: false, message: 'Failed to parse JSON: ' + (error as Error).message, count: 0 };
    }
  }

  /**
   * Import inventory from CSV
   */
  importFromCSV(csvString: string): { success: boolean; message: string; count: number } {
    try {
      const lines = csvString.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        return { success: false, message: 'CSV must have header and at least one data row', count: 0 };
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const idIndex = headers.findIndex(h => h === 'id');
      const nameIndex = headers.findIndex(h => h === 'name');
      const categoryIndex = headers.findIndex(h => h === 'category');
      const quantityIndex = headers.findIndex(h => h === 'quantity');
      const priceIndex = headers.findIndex(h => h === 'price');
      const supplierIndex = headers.findIndex(h => h.includes('supplier'));
      const popularIndex = headers.findIndex(h => h.includes('popular'));
      const commentIndex = headers.findIndex(h => h.includes('comment'));

      if (idIndex === -1 || nameIndex === -1 || categoryIndex === -1 ||
          quantityIndex === -1 || priceIndex === -1 || supplierIndex === -1) {
        return { success: false, message: 'CSV missing required columns (ID, Name, Category, Quantity, Price, Supplier)', count: 0 };
      }

      const importedItems: Item[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length < 6) continue;

        const quantity = parseInt(values[quantityIndex], 10);
        const price = parseFloat(values[priceIndex]);

        if (!values[idIndex] || !values[nameIndex] || !values[categoryIndex] ||
            isNaN(quantity) || isNaN(price)) {
          continue;
        }

        const item: Item = {
          id: values[idIndex].trim(),
          name: values[nameIndex].replace(/^"|"$/g, '').trim(),
          category: this.validateCategory(values[categoryIndex].trim()),
          quantity,
          price,
          supplierName: values[supplierIndex]?.replace(/^"|"$/g, '').trim() || '',
          stockStatus: calculateStockStatus(quantity),
          isPopular: popularIndex !== -1 ? values[popularIndex].toLowerCase().includes('yes') : false,
          comment: commentIndex !== -1 ? values[commentIndex]?.replace(/^"|"$/g, '').trim() : undefined
        };

        importedItems.push(item);
      }

      if (importedItems.length === 0) {
        return { success: false, message: 'No valid items found in CSV', count: 0 };
      }

      this.items = importedItems;
      this.saveToStorage();

      this.addAuditEntry(
        'IMPORT',
        'BATCH',
        `${importedItems.length} items`,
        `Imported ${importedItems.length} items from CSV`
      );

      return { success: true, message: `Successfully imported ${importedItems.length} items`, count: importedItems.length };
    } catch (error) {
      return { success: false, message: 'Failed to parse CSV: ' + (error as Error).message, count: 0 };
    }
  }

  /**
   * Parse CSV line handling quoted values
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);

    return result;
  }

  /**
   * Validate and normalize category
   */
  private validateCategory(category: string): Item['category'] {
    const validCategories: Item['category'][] = ['Electronics', 'Furniture', 'Clothing', 'Tools', 'Miscellaneous'];
    const normalized = category.trim();
    if (validCategories.includes(normalized as Item['category'])) {
      return normalized as Item['category'];
    }
    return 'Miscellaneous';
  }

  /**
   * Batch delete items
   */
  batchDelete(itemIds: string[]): { success: boolean; deletedCount: number; failedIds: string[] } {
    const failedIds: string[] = [];
    let deletedCount = 0;

    for (const id of itemIds) {
      const index = this.items.findIndex(item => item.id === id);
      if (index !== -1) {
        const item = this.items[index];
        this.items.splice(index, 1);
        deletedCount++;

        this.addAuditEntry(
          'DELETE',
          item.id,
          item.name,
          `Batch deleted`
        );
      } else {
        failedIds.push(id);
      }
    }

    if (deletedCount > 0) {
      this.saveToStorage();
    }

    return { success: failedIds.length === 0, deletedCount, failedIds };
  }

  /**
   * Reset to initial sample data
   */
  resetToSampleData(): void {
    this.items = [...INITIAL_ITEMS];
    this.saveToStorage();

    this.addAuditEntry(
      'IMPORT',
      'SYSTEM',
      'Sample Data',
      'Reset inventory to sample data'
    );
  }

  /**
   * Get alerts for low stock and out of stock items
   */
  getStockAlerts(): { type: 'warning' | 'danger'; item: Item }[] {
    const alerts: { type: 'warning' | 'danger'; item: Item }[] = [];

    for (const item of this.items) {
      if (item.stockStatus === 'Out of Stock') {
        alerts.push({ type: 'danger', item });
      } else if (item.stockStatus === 'Low Stock') {
        alerts.push({ type: 'warning', item });
      }
    }

    return alerts;
  }
}
