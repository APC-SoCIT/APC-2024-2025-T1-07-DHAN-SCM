import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';

import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { 
  ItemsService, 
  InventoryReport, 
  Activity, 
  MaintenanceSchedule, 
  CalibrationStats 
} from '../../core/services/items.service';
import { Item } from '../../core/models/item.interface';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatBadgeModule,
    MatButtonModule,
    MatTableModule,
    MatDividerModule,
    MatTabsModule,
    MatProgressBarModule,
    NgxChartsModule,
    RouterModule
  ],
  template: `
    <div class="dashboard-container">

      <!-- Summary Cards -->
      <div class="summary-cards">
        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>Total Items</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="card-content">
              <mat-icon>inventory_2</mat-icon>
              <span class="count">{{ totalItems }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card warning" routerLink="/items" [queryParams]="{filter: 'maintenance-due'}">
          <mat-card-header>
            <mat-card-title>Maintenance Due</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="card-content">
              <mat-icon>build</mat-icon>
              <span class="count">{{ maintenanceDueCount }}</span>
            </div>
            <div class="trend-indicator" *ngIf="maintenanceTrend !== 0">
              <mat-icon [class.up]="maintenanceTrend > 0" [class.down]="maintenanceTrend < 0">
                {{ maintenanceTrend > 0 ? 'trending_up' : 'trending_down' }}
              </mat-icon>
              <span>{{ abs(maintenanceTrend) }}% from last month</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card alert" routerLink="/items" [queryParams]="{filter: 'warranty-expiring'}">
          <mat-card-header>
            <mat-card-title>Warranty Expiring</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="card-content">
              <mat-icon>warning</mat-icon>
              <span class="count">{{ warrantyExpiringCount }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card info">
          <mat-card-header>
            <mat-card-title>Calibration Status</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="card-content">
              <mat-icon>science</mat-icon>
              <span class="count">{{ calibrationStats.dueCount }}</span>
            </div>
            <div class="sub-stats">
              <span>{{ calibrationStats.completedThisMonth }} completed this month</span>
              <mat-progress-bar mode="determinate" [value]="calibrationStats.completionRate"></mat-progress-bar>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Main Dashboard Content -->
      <mat-tab-group>
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="tab-content">
            <!-- Status Distribution Chart -->
            <div class="chart-container">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Status Distribution</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <ngx-charts-pie-chart
                    [results]="statusDistribution"
                    [scheme]="colorScheme"
                    [gradient]="true"
                    [legend]="true"
                    [labels]="true">
                  </ngx-charts-pie-chart>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Category Distribution Chart -->
            <div class="chart-container">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Product Categories</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <ngx-charts-bar-vertical
                    [results]="categoryDistribution"
                    [scheme]="colorScheme"
                    [gradient]="true"
                    [xAxis]="true"
                    [yAxis]="true"
                    [showXAxisLabel]="true"
                    [showYAxisLabel]="true"
                    xAxisLabel="Category"
                    yAxisLabel="Count">
                  </ngx-charts-bar-vertical>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- Maintenance Schedule Tab -->
        <mat-tab label="Maintenance Schedule">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Upcoming Maintenance</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="timeline">
                  <div class="timeline-item" *ngFor="let schedule of maintenanceSchedule">
                    <div class="timeline-badge" [class.overdue]="schedule.isOverdue">
                      <mat-icon>{{ schedule.isOverdue ? 'warning' : 'event' }}</mat-icon>
                    </div>
                    <div class="timeline-content">
                      <h3>{{ schedule.serialNumber }} - {{ schedule.productName }}</h3>
                      <p>Due: {{ schedule.dueDate | date:'mediumDate' }}</p>
                      <p>Type: {{ schedule.maintenanceType }}</p>
                      <button mat-button color="primary" (click)="recordMaintenance(schedule)">
                        Record Maintenance
                      </button>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>


        <!-- Recent Activities Tab -->
        <mat-tab label="Recent Activities">
          <div class="tab-content">
            <mat-card>
              <mat-card-content>
                <table mat-table [dataSource]="recentActivities">
                  <ng-container matColumnDef="date">
                    <th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let activity">{{ activity.date | date:'short' }}</td>
                  </ng-container>

                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef>Type</th>
                    <td mat-cell *matCellDef="let activity">{{ activity.type }}</td>
                  </ng-container>

                  <ng-container matColumnDef="item">
                    <th mat-header-cell *matHeaderCellDef>Item</th>
                    <td mat-cell *matCellDef="let activity">{{ activity.serialNumber }}</td>
                  </ng-container>

                  <ng-container matColumnDef="description">
                    <th mat-header-cell *matHeaderCellDef>Description</th>
                    <td mat-cell *matCellDef="let activity">{{ activity.description }}</td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="['date', 'type', 'item', 'description']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['date', 'type', 'item', 'description'];"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .quick-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;

      button {
        flex: 1;
        min-width: 200px;
        mat-icon {
          margin-right: 8px;
        }
      }
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .summary-card {
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-2px);
      }

      .card-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 20px;

        mat-icon {
          font-size: 36px;
          width: 36px;
          height: 36px;
        }

        .count {
          font-size: 32px;
          font-weight: bold;
        }
      }

      .trend-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 8px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;

          &.up { color: #4caf50; }
          &.down { color: #f44336; }
        }
      }

      .sub-stats {
        padding: 16px;
        text-align: center;

        span {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.6);
        }
      }

      &.warning {
        background-color: #fff3e0;
        mat-icon {
          color: #f57c00;
        }
      }

      &.alert {
        background-color: #fbe9e7;
        mat-icon {
          color: #d84315;
        }
      }

      &.info {
        background-color: #e3f2fd;
        mat-icon {
          color: #1976d2;
        }
      }
    }

    .tab-content {
      padding: 20px 0;
    }

    .chart-container {
      margin-bottom: 20px;
      height: 400px;

      mat-card-content {
        height: 350px;
      }
    }

    .timeline {
      padding: 20px;

      .timeline-item {
        display: flex;
        gap: 20px;
        margin-bottom: 30px;
        position: relative;

        &:not(:last-child):before {
          content: '';
          position: absolute;
          left: 20px;
          top: 40px;
          bottom: -30px;
          width: 2px;
          background-color: rgba(0, 0, 0, 0.12);
        }

        .timeline-badge {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #2196f3;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          mat-icon {
            color: white;
          }

          &.overdue {
            background-color: #f44336;
          }
        }

        .timeline-content {
          flex: 1;
          background-color: white;
          padding: 16px;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

          h3 {
            margin: 0 0 8px;
            font-size: 16px;
            font-weight: 500;
          }

          p {
            margin: 0 0 8px;
            color: rgba(0, 0, 0, 0.6);
          }
        }
      }
    }



    table {
      width: 100%;

      th.mat-header-cell {
        font-weight: bold;
        color: rgba(0, 0, 0, 0.87);
      }

      td.mat-cell {
        padding: 12px 8px;
      }

      tr.mat-row:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }
    }
  `]
})
export class DashboardHomeComponent implements OnInit {
  totalItems = 0;
  maintenanceDueCount = 0;
  warrantyExpiringCount = 0;
  maintenanceTrend = 0;
  statusCounts: { [key: string]: number } = {};
  recentActivities: Activity[] = [];
  maintenanceSchedule: MaintenanceSchedule[] = [];
  calibrationStats = {
    dueCount: 0,
    completedThisMonth: 0,
    completionRate: 0
  };

  // Chart data
  statusDistribution: any[] = [];
  categoryDistribution: any[] = [];
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0']
  };

  constructor(
    private itemsService: ItemsService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadRecentActivities();
    this.loadMaintenanceSchedule();

  }

  private loadDashboardData(): void {
    this.itemsService.getInventoryReport().subscribe({
      next: (data: InventoryReport) => {
        // Update counts
        this.totalItems = Object.values(data.totalCounts).reduce((sum, count) => sum + count, 0);
        this.maintenanceDueCount = data.alerts.maintenanceDue;
        this.warrantyExpiringCount = data.alerts.warrantyExpiring;
        this.statusCounts = data.totalCounts;
        this.maintenanceTrend = data.maintenanceTrend;
        this.calibrationStats = data.calibrationStats;

        // Transform data for charts
        this.statusDistribution = Object.entries(data.totalCounts).map(([name, value]) => ({
          name: this.capitalizeStatus(name),
          value
        }));

        this.categoryDistribution = data.categoryDistribution;
      },
      error: (error: Error) => {
        console.error('Error loading dashboard data:', error);
      }
    });
  }

  private loadRecentActivities(): void {
    this.itemsService.getRecentActivities().subscribe({
      next: (activities) => {
        this.recentActivities = activities;
      },
      error: (error) => {
        console.error('Error loading recent activities:', error);
      }
    });
  }

  private loadMaintenanceSchedule(): void {
    this.itemsService.getMaintenanceSchedule().subscribe({
      next: (schedule) => {
        this.maintenanceSchedule = schedule;
      },
      error: (error) => {
        console.error('Error loading maintenance schedule:', error);
      }
    });
  }


  recordMaintenance(schedule: any): void {
    // TODO: Implement maintenance recording dialog
    console.log('Recording maintenance for:', schedule);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'inventory':
        return '#4caf50';
      case 'demo':
        return '#2196f3';
      case 'delivery':
        return '#ff9800';
      case 'maintenance':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  }

  capitalizeStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  abs(value: number): number {
    return Math.abs(value);
  }
}
