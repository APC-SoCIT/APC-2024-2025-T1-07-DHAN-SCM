import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `],
  standalone: true,
  imports: [RouterOutlet]
})
export class AppComponent {
  title = 'Inventory Management System';
}
