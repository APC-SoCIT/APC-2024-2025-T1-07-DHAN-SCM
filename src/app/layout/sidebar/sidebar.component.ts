import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { NavigationService, NavItem } from '@core/services/navigation.service';



@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  navItems: NavItem[] = [];

  constructor(private navigationService: NavigationService) {}

  ngOnInit() {
    this.navigationService.getVisibleNavItems().subscribe(
      items => this.navItems = items
    );
  }
}
