import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../services/inventory.service';
import { Item } from '../models/item.model';

/**
 * SearchComponent - Handles search and filtering of inventory items
 * Provides search by name and filter by category/stock status with advanced options
 */
@Component({
  selector: 'app-search',
  standalone: false,
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {
  /** All items from service */
  allItems: Item[] = [];
  
  /** Filtered items for display */
  filteredItems: Item[] = [];
  
  /** Search term for item name */
  searchTerm = '';
  
  /** Selected category filter */
  selectedCategory = 'All';
  
  /** Selected stock status filter */
  selectedStockStatus = 'All';
  
  /** Filter for popular items only */
  popularOnly = false;
  
  /** Whether a search has been performed */
  hasSearched = false;
  
  /** Available categories for filter */
  categories = ['All', 'Electronics', 'Furniture', 'Clothing', 'Tools', 'Miscellaneous'];
  
  /** Available stock statuses for filter */
  stockStatuses = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];
  
  /** Sort configuration */
  sortBy: 'name' | 'quantity' | 'price' | 'category' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  /** Advanced filters */
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minQuantity: number | null = null;
  maxQuantity: number | null = null;
  selectedSupplier = 'All';
  suppliers: string[] = ['All'];

  /** Show advanced filters */
  showAdvanced = false;

  constructor(private inventoryService: InventoryService) {}

  /**
   * Initialize component with all items
   */
  ngOnInit(): void {
    this.loadAllItems();
    this.loadSuppliers();
  }

  /**
   * Load all items from service
   */
  loadAllItems(): void {
    this.allItems = this.inventoryService.getAllItems();
    this.filteredItems = [...this.allItems];
  }

  /**
   * Load unique suppliers
   */
  loadSuppliers(): void {
    this.suppliers = ['All', ...this.inventoryService.getUniqueSuppliers()];
  }

  /**
   * Perform search with current filters
   */
  search(): void {
    this.hasSearched = true;
    
    // Start with name search
    let results = this.searchTerm.trim() 
      ? this.inventoryService.searchItemsByName(this.searchTerm)
      : [...this.allItems];

    // Apply category filter
    if (this.selectedCategory !== 'All') {
      results = results.filter(item => item.category === this.selectedCategory);
    }

    // Apply stock status filter
    if (this.selectedStockStatus !== 'All') {
      results = results.filter(item => item.stockStatus === this.selectedStockStatus);
    }

    // Apply popular filter
    if (this.popularOnly) {
      results = results.filter(item => item.isPopular);
    }

    // Apply price range filter
    if (this.minPrice !== null && this.minPrice !== undefined) {
      results = results.filter(item => item.price >= this.minPrice!);
    }
    if (this.maxPrice !== null && this.maxPrice !== undefined) {
      results = results.filter(item => item.price <= this.maxPrice!);
    }

    // Apply quantity range filter
    if (this.minQuantity !== null && this.minQuantity !== undefined) {
      results = results.filter(item => item.quantity >= this.minQuantity!);
    }
    if (this.maxQuantity !== null && this.maxQuantity !== undefined) {
      results = results.filter(item => item.quantity <= this.maxQuantity!);
    }

    // Apply supplier filter
    if (this.selectedSupplier !== 'All') {
      results = results.filter(item => item.supplierName === this.selectedSupplier);
    }

    // Apply sorting
    results = this.sortItems(results);

    this.filteredItems = results;
  }

  /**
   * Sort items based on current sort configuration
   */
  private sortItems(items: Item[]): Item[] {
    return [...items].sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Set sort field and direction
   */
  setSort(field: 'name' | 'quantity' | 'price' | 'category'): void {
    if (this.sortBy === field) {
      // Toggle direction if same field
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New field, default to ascending
      this.sortBy = field;
      this.sortDirection = 'asc';
    }
    this.search();
  }

  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'All';
    this.selectedStockStatus = 'All';
    this.popularOnly = false;
    this.sortBy = 'name';
    this.sortDirection = 'asc';
    this.hasSearched = false;
    this.minPrice = null;
    this.maxPrice = null;
    this.minQuantity = null;
    this.maxQuantity = null;
    this.selectedSupplier = 'All';
    this.showAdvanced = false;
    this.filteredItems = [...this.allItems];
  }

  /**
   * Clear search term only
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.search();
  }

  /**
   * Toggle advanced filters visibility
   */
  toggleAdvanced(): void {
    this.showAdvanced = !this.showAdvanced;
  }

  /**
   * Get stock status CSS class for styling
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
   * Format currency for display
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(value);
  }

  /**
   * Get result count message
   */
  getResultMessage(): string {
    const count = this.filteredItems.length;
    if (count === 0) {
      return 'No items found matching your criteria.';
    } else if (count === 1) {
      return '1 item found.';
    } else {
      return `${count} items found.`;
    }
  }

  /**
   * Get sort indicator for column header
   */
  getSortIndicator(field: string): string {
    if (this.sortBy !== field) {
      return '↕️';
    }
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  /**
   * Get active filters count
   */
  getActiveFiltersCount(): number {
    let count = 0;
    if (this.selectedCategory !== 'All') count++;
    if (this.selectedStockStatus !== 'All') count++;
    if (this.popularOnly) count++;
    if (this.minPrice !== null) count++;
    if (this.maxPrice !== null) count++;
    if (this.minQuantity !== null) count++;
    if (this.maxQuantity !== null) count++;
    if (this.selectedSupplier !== 'All') count++;
    return count;
  }
}
