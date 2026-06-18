import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../services/inventory.service';
import { Item } from '../models/item.model';

interface StockAlert {
  type: 'warning' | 'danger';
  item: Item;
}

/**
 * HomeComponent - Landing page for the Inventory Management System
 * Displays app purpose, statistics, popular items, and stock alerts
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
    lowStockThreshold: number;
  } | null = null;

  /** Popular items to display */
  popularItems: Item[] = [];

  /** Stock alerts */
  stockAlerts: StockAlert[] = [];

  /** Recent activity from audit log */
  recentActivity: { action: string; itemName: string; details: string }[] = [];

  constructor(private inventoryService: InventoryService) {}

  /**
   * Initialize component data
   */
  ngOnInit(): void {
    this.loadStatistics();
    this.loadPopularItems();
    this.loadStockAlerts();
    this.loadRecentActivity();
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
   * Load stock alerts
   */
  private loadStockAlerts(): void {
    this.stockAlerts = this.inventoryService.getStockAlerts();
  }

  /**
   * Load recent activity
   */
  private loadRecentActivity(): void {
    const auditLog = this.inventoryService.getAuditLog(5);
    this.recentActivity = auditLog.map(entry => ({
      action: entry.action,
      itemName: entry.itemName,
      details: entry.details
    }));
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
   * Get action icon
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
}
