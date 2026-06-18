import { Component } from '@angular/core';

/**
 * HelpComponent - Provides FAQs and troubleshooting guidance
 * Helps users understand how to use the inventory system
 */
interface FAQ {
  question: string;
  answer: string;
  isOpen: boolean;
}

interface TroubleshootingItem {
  problem: string;
  solutions: string[];
}

@Component({
  selector: 'app-help',
  standalone: false,
  templateUrl: './help.component.html',
  styleUrl: './help.component.css'
})
export class HelpComponent {
  /** Search term for filtering FAQs */
  searchTerm = '';

  /** FAQs data */
  faqs: FAQ[] = [
    {
      question: 'How do I add a new item to the inventory?',
      answer: 'Navigate to the "Manage" page, click on the "Add Item" tab, and fill in the required fields (Item ID, Name, Category, Quantity, Price, Supplier Name). Item ID must be unique. Click "Add Item" to save. The Comment field is optional.',
      isOpen: false
    },
    {
      question: 'How do I edit an existing item?',
      answer: 'Go to the "Manage" page and select the "Edit Item" tab. Enter the exact item name in the search box and click "Search". Once the item is found, modify the fields you want to change and click "Update Item". Note that the Item ID cannot be changed.',
      isOpen: false
    },
    {
      question: 'How do I delete an item?',
      answer: 'Navigate to "Manage" > "Delete Item" tab. Enter the item name in the search box and click "Search". Review the item details displayed, then click "Delete This Item". You will be asked to confirm the deletion before it is permanently removed.',
      isOpen: false
    },
    {
      question: 'Why does my data disappear when I refresh the page?',
      answer: 'This is a demonstration application that stores data only in browser memory. All inventory data will be lost when you close or refresh the browser. This is expected behavior for this version of the application.',
      isOpen: false
    },
    {
      question: 'How does the stock status work?',
      answer: 'Stock status is calculated automatically based on quantity: "Out of Stock" (0 items), "Low Stock" (1-5 items), or "In Stock" (6+ items). When you add or edit an item, the status updates automatically based on the quantity you enter.',
      isOpen: false
    },
    {
      question: 'How do I search for items?',
      answer: 'Use the "Search" page to find items. You can search by name (partial matches work), filter by category, filter by stock status, or show only popular items. Click on column headers to sort results. Leave the search box empty and click "Search" to see all items.',
      isOpen: false
    },
    {
      question: 'What are "Popular Items"?',
      answer: 'Popular items are marked with a star (⭐) and represent best-selling or high-priority inventory items. You can mark any item as popular when adding or editing. Use the "Popular Items Only" filter on the Search page to find them quickly.',
      isOpen: false
    },
    {
      question: 'Why do I get an error saying "Item ID already exists"?',
      answer: 'Each item must have a unique Item ID. This prevents duplicate entries and ensures data integrity. If you see this error, choose a different unique ID for your new item.',
      isOpen: false
    },
    {
      question: 'Can I change an Item ID after creation?',
      answer: 'No, Item IDs cannot be changed once an item is created. This is by design to maintain data integrity. If you need a different ID, you must delete the item and create a new one with the desired ID.',
      isOpen: false
    },
    {
      question: 'What categories are available?',
      answer: 'Items can be categorized as: Electronics, Furniture, Clothing, Tools, or Miscellaneous. Choose the category that best fits your item when adding it to the inventory.',
      isOpen: false
    }
  ];

  /** Troubleshooting data */
  troubleshooting: TroubleshootingItem[] = [
    {
      problem: 'Cannot add item - "Item ID already exists" error',
      solutions: [
        'Choose a unique Item ID that hasn\'t been used before',
        'Check the "View All" tab to see existing item IDs',
        'Use a naming convention like ITEM001, ITEM002, etc.',
        'IDs are case-sensitive - ITEM001 and item001 are different'
      ]
    },
    {
      problem: 'Item not found when searching to edit or delete',
      solutions: [
        'Make sure you enter the exact item name (case-insensitive)',
        'Check for extra spaces before or after the name',
        'Use the "View All" tab to verify the item exists',
        'Try searching with a partial name on the Search page'
      ]
    },
    {
      problem: 'Form validation errors when adding/updating item',
      solutions: [
        'Ensure all required fields are filled (marked with *)',
        'Quantity and Price must be non-negative numbers',
        'Item ID and Name cannot be empty or only spaces',
        'Price should be a valid number (e.g., 29.99)'
      ]
    },
    {
      problem: 'Search returns no results',
      solutions: [
        'Try a broader search term (partial matches work)',
        'Check if filters are applied that might exclude results',
        'Click "Reset Filters" to clear all filters',
        'Ensure you\'re on the Search page, not Manage page'
      ]
    },
    {
      problem: 'Data disappeared after closing the browser',
      solutions: [
        'This is expected behavior - data is not persisted',
        'The application stores data only in browser memory',
        'For testing, keep the browser tab open',
        'Consider taking notes of important inventory data'
      ]
    },
    {
      problem: 'Page not loading or blank screen',
      solutions: [
        'Refresh the page (F5 or Ctrl+R)',
        'Clear browser cache and reload',
        'Check browser console for error messages',
        'Try using a different browser (Chrome, Firefox, Edge)'
      ]
    }
  ];

  /**
   * Toggle FAQ open/close state
   */
  toggleFAQ(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }

  /**
   * Get filtered FAQs based on search term
   */
  getFilteredFAQs(): FAQ[] {
    if (!this.searchTerm.trim()) {
      return this.faqs;
    }

    const term = this.searchTerm.toLowerCase();
    return this.faqs.filter(faq => 
      faq.question.toLowerCase().includes(term) ||
      faq.answer.toLowerCase().includes(term)
    );
  }

  /**
   * Clear search term
   */
  clearSearch(): void {
    this.searchTerm = '';
  }

  /**
   * Expand all FAQs
   */
  expandAll(): void {
    this.faqs.forEach(faq => faq.isOpen = true);
  }

  /**
   * Collapse all FAQs
   */
  collapseAll(): void {
    this.faqs.forEach(faq => faq.isOpen = false);
  }
}
