import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar color="primary">
      <span>Inventory Management System</span>
    </mat-toolbar>
    <main class="content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    .content {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
  `],
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule]
})
export class AppComponent {
  title = 'Inventory Management System';
}
