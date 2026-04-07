import { Component } from '@angular/core';

/**
 * PrivacyComponent - Displays privacy and security information
 * Explains key security considerations for the inventory system
 */
@Component({
  selector: 'app-privacy',
  standalone: false,
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.css'
})
export class PrivacyComponent {
  /** Last updated date */
  lastUpdated = 'April 2026';
}
