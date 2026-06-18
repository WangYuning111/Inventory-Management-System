/**
 * Item Model - Data structure for inventory items
 * Represents a single inventory item with all required fields
 */
export interface Item {
  /** Unique identifier for the item - can only be entered once */
  id: string;
  /** Name of the item - used for updates and deletions */
  name: string;
  /** Category: Electronics, Furniture, Clothing, Tools, Miscellaneous */
  category: 'Electronics' | 'Furniture' | 'Clothing' | 'Tools' | 'Miscellaneous';
  /** Quantity in stock */
  quantity: number;
  /** Price per unit */
  price: number;
  /** Supplier name */
  supplierName: string;
  /** Stock status based on quantity: In Stock, Low Stock, Out of Stock */
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  /** Whether this is a popular item: Yes or No */
  isPopular: boolean;
  /** Optional comment about the item */
  comment?: string;
}

/**
 * Calculate stock status based on quantity
 * @param quantity - current stock quantity
 * @returns StockStatus - determined by quantity level
 */
export function calculateStockStatus(quantity: number): 'In Stock' | 'Low Stock' | 'Out of Stock' {
  if (quantity === 0) {
    return 'Out of Stock';
  } else if (quantity <= 5) {
    return 'Low Stock';
  } else {
    return 'In Stock';
  }
}

/**
 * Initial sample data for the inventory system
 */
export const INITIAL_ITEMS: Item[] = [
  {
    id: 'ITEM001',
    name: 'Wireless Mouse',
    category: 'Electronics',
    quantity: 25,
    price: 29.99,
    supplierName: 'TechCorp',
    stockStatus: 'In Stock',
    isPopular: true,
    comment: 'Best seller this month'
  },
  {
    id: 'ITEM002',
    name: 'Office Chair',
    category: 'Furniture',
    quantity: 8,
    price: 199.99,
    supplierName: 'ComfortSeating',
    stockStatus: 'Low Stock',
    isPopular: true
  },
  {
    id: 'ITEM003',
    name: 'Cotton T-Shirt',
    category: 'Clothing',
    quantity: 50,
    price: 15.99,
    supplierName: 'FashionHub',
    stockStatus: 'In Stock',
    isPopular: false,
    comment: 'Summer collection'
  },
  {
    id: 'ITEM004',
    name: 'Power Drill',
    category: 'Tools',
    quantity: 0,
    price: 89.99,
    supplierName: 'ToolMaster',
    stockStatus: 'Out of Stock',
    isPopular: true,
    comment: 'Restock expected next week'
  },
  {
    id: 'ITEM005',
    name: 'Desk Lamp',
    category: 'Miscellaneous',
    quantity: 15,
    price: 35.50,
    supplierName: 'LightWorks',
    stockStatus: 'In Stock',
    isPopular: false
  }
];
