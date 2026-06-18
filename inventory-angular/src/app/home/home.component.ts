import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../services/inventory.service';
import { Item } from '../models/item.model';

/**
 * HomeComponent - Landing page for the Inventory Management System
 * Displays app purpose, statistics, and popular items
 */
@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  /** Application name */
  appName = 'Inventory Management System';
  
  /** Application description/purpose */
  appDescription = 'A comprehensive solution for managing your inventory efficiently. Track items, monitor stock levels, and manage suppliers all in one place.';

  /** Statistics data */
  stats: {
    totalItems: number;
    totalStock: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    popularItems: number;
    totalValue: number;
  } | null = null;

  /** Popular items to display */
  popularItems: Item[] = [];

  constructor(private inventoryService: InventoryService) {}

  /**
   * Initialize component data
   */
  ngOnInit(): void {
    this.loadStatistics();
    this.loadPopularItems();
  }

  /**
   * Load inventory statistics
   */
  private loadStatistics(): void {
    this.stats = this.inventoryService.getStatistics();
  }

  /**
   * Load popular items
   */
  private loadPopularItems(): void {
    this.popularItems = this.inventoryService.getPopularItems();
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
}
