import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h2>Reports</h2>
      <p>Reports management coming soon...</p>
    </div>
  `,
  styles: [`
    .container {
      padding: 24px;
    }
  `]
})
export class ReportsComponent {}
