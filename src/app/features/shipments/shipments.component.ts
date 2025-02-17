import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shipments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h2>Shipments</h2>
      <p>Shipments management coming soon...</p>
    </div>
  `,
  styles: [`
    .container {
      padding: 24px;
    }
  `]
})
export class ShipmentsComponent {}
