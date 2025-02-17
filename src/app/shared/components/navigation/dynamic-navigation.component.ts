import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { NavigationService, NavItem } from '@core/services/navigation.service';

@Component({
  selector: 'app-dynamic-navigation',
  standalone: true,
  imports: [
    CommonModule, 
    MatListModule, 
    MatIconModule,
    RouterModule
  ],
  templateUrl: './dynamic-navigation.component.html',
  styleUrls: ['./dynamic-navigation.component.scss']
})
export class DynamicNavigationComponent implements OnInit {
  navItems: NavItem[] = [];

  constructor(private navigationService: NavigationService) {}

  ngOnInit(): void {
    this.navigationService.getVisibleNavItems().subscribe(
      items => this.navItems = items
    );
  }

  navigateTo(route: string): void {
    console.log(`[DynamicNavigationComponent] Navigating to: ${route}`);
    this.navigationService.navigateTo(route);
  }
}
