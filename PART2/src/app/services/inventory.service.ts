import { Injectable } from '@angular/core';
import { Item, INITIAL_ITEMS, calculateStockStatus } from '../models/item.model';

/**
 * InventoryService - Manages all inventory data operations
 * Provides CRUD operations and search functionality
 */
@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  /** Array storing all inventory items */
  private items: Item[] = [];

  constructor() {
    // Initialize with sample data
    this.items = [...INITIAL_ITEMS];
  }

  /**
   * Get all items in the inventory
   * @returns Array of all Item objects
   */
  getAllItems(): Item[] {
    return [...this.items];
  }

  /**
   * Get only popular items
   * @returns Array of popular Item objects
   */
  getPopularItems(): Item[] {
    return this.items.filter(item => item.isPopular);
  }

  /**
   * Get item by ID
   * @param id - Item ID to search for
   * @returns Item if found, undefined otherwise
   */
  getItemById(id: string): Item | undefined {
    return this.items.find(item => item.id === id);
  }

  /**
   * Get item by name
   * @param name - Item name to search for
   * @returns Item if found, undefined otherwise
   */
  getItemByName(name: string): Item | undefined {
    return this.items.find(item => 
      item.name.toLowerCase() === name.toLowerCase()
    );
  }

  /**
   * Check if item ID already exists
   * @param id - Item ID to check
   * @returns true if exists, false otherwise
   */
  itemIdExists(id: string): boolean {
    return this.items.some(item => item.id === id);
  }

  /**
   * Check if item name already exists
   * @param name - Item name to check
   * @returns true if exists, false otherwise
   */
  itemNameExists(name: string): boolean {
    return this.items.some(item => 
      item.name.toLowerCase() === name.toLowerCase()
    );
  }

  /**
   * Add a new item to the inventory
   * @param item - Item to add (without calculated fields)
   * @returns true if added successfully, false if ID already exists
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
    return true;
  }

  /**
   * Update an existing item by name
   * @param name - Name of item to update
   * @param updates - Partial item with fields to update
   * @returns true if updated, false if item not found
   */
  updateItemByName(name: string, updates: Partial<Omit<Item, 'id' | 'stockStatus'>>): boolean {
    const index = this.items.findIndex(item => 
      item.name.toLowerCase() === name.toLowerCase()
    );

    if (index === -1) {
      return false;
    }

    // Update the item
    this.items[index] = {
      ...this.items[index],
      ...updates
    };

    // Recalculate stock status if quantity changed
    if (updates.quantity !== undefined) {
      this.items[index].stockStatus = calculateStockStatus(updates.quantity);
    }

    return true;
  }

  /**
   * Delete an item by name with confirmation
   * @param name - Name of item to delete
   * @returns true if deleted, false if not found
   */
  deleteItemByName(name: string): boolean {
    const index = this.items.findIndex(item => 
      item.name.toLowerCase() === name.toLowerCase()
    );

    if (index === -1) {
      return false;
    }

    this.items.splice(index, 1);
    return true;
  }

  /**
   * Search items by name (partial match)
   * @param searchTerm - Search term
   * @returns Array of matching items
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
   * Get inventory statistics
   * @returns Object with count statistics
   */
  getStatistics(): {
    totalItems: number;
    totalStock: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    popularItems: number;
    totalValue: number;
  } {
    return {
      totalItems: this.items.length,
      totalStock: this.items.reduce((sum, item) => sum + item.quantity, 0),
      inStock: this.items.filter(item => item.stockStatus === 'In Stock').length,
      lowStock: this.items.filter(item => item.stockStatus === 'Low Stock').length,
      outOfStock: this.items.filter(item => item.stockStatus === 'Out of Stock').length,
      popularItems: this.items.filter(item => item.isPopular).length,
      totalValue: this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
  }
}
