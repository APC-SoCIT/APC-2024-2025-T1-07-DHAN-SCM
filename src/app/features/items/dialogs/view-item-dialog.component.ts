import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Item } from '../../../core/models/item.interface';

@Component({
  selector: 'app-view-item-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title>Item Details</h2>
    <mat-dialog-content>
      <!-- Basic Information -->
      <section>
        <h3>Basic Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Serial Number:</label>
            <span>{{item.serialNumber}}</span>
          </div>
          <div class="info-item">
            <label>Status:</label>
            <mat-chip-set>
              <mat-chip [color]="getStatusColor(item.status)" selected>{{capitalizeStatus(item.status)}}</mat-chip>
            </mat-chip-set>
          </div>
          <div class="info-item">
            <label>Product:</label>
            <span>
              {{item.product.name || 'Unknown Product'}}
              {{item.product.model ? ' - ' + item.product.model : ''}}
            </span>
          </div>
          <div class="info-item">
            <label>Manufacturer:</label>
            <span>{{item.product.manufacturer || 'N/A'}}</span>
          </div>
        </div>
      </section>

      <mat-divider></mat-divider>

      <!-- Purchase Information -->
      <section>
        <h3>Purchase Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Purchase Date:</label>
            <span>{{item.purchaseInfo?.date | date}}</span>
          </div>
          <div class="info-item">
            <label>Cost:</label>
            <span>{{item.purchaseInfo?.cost !== undefined ? ('$' + item.purchaseInfo?.cost) : 'N/A'}}</span>
          </div>
          <div class="info-item">
            <label>Supplier:</label>
            <span>{{item.purchaseInfo?.supplier || 'N/A'}}</span>
          </div>
          <div class="info-item">
            <label>Order Reference:</label>
            <span>{{item.purchaseInfo?.orderReference || 'N/A'}}</span>
          </div>
        </div>
      </section>

      <mat-divider></mat-divider>

      <!-- Warranty Information -->
      <section>
        <h3>Warranty Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Start Date:</label>
            <span>{{item.warranty?.startDate | date}}</span>
          </div>
          <div class="info-item">
            <label>End Date:</label>
            <span>{{item.warranty?.endDate | date}}</span>
          </div>
          <div class="info-item">
            <label>Claim History:</label>
            <span>{{item.warranty?.claimHistory?.length || 0}} claims</span>
          </div>
        </div>
      </section>

      <mat-divider></mat-divider>

      <!-- Maintenance History -->
      <section>
        <h3>Maintenance History</h3>
        <div class="history-list" *ngIf="item.maintenanceHistory?.length; else noMaintenance">
          <div class="history-item" *ngFor="let maintenance of item.maintenanceHistory">
            <div class="history-header">
              <span class="date">{{maintenance.date | date}}</span>
              <mat-chip>{{maintenance.type}}</mat-chip>
            </div>
            <div class="history-content">
              <p><strong>Description:</strong> {{maintenance.description}}</p>
              <p><strong>Performed By:</strong> {{maintenance.performedBy}}</p>
              <p *ngIf="maintenance.nextDueDate"><strong>Next Due:</strong> {{maintenance.nextDueDate | date}}</p>
              <p *ngIf="maintenance.cost !== undefined"><strong>Cost:</strong> \${{maintenance.cost}}</p>
            </div>
          </div>
        </div>
        <ng-template #noMaintenance>
          <p class="no-data">No maintenance records found</p>
        </ng-template>
      </section>

      <mat-divider></mat-divider>

      <!-- Calibration History -->
      <section>
        <h3>Calibration History</h3>
        <div class="history-list" *ngIf="item.calibrationHistory?.length; else noCalibration">
          <div class="history-item" *ngFor="let calibration of item.calibrationHistory">
            <div class="history-header">
              <span class="date">{{calibration.date | date}}</span>
            </div>
            <div class="history-content">
              <p><strong>Performed By:</strong> {{calibration.performedBy}}</p>
              <p><strong>Next Due:</strong> {{calibration.nextDueDate | date}}</p>
              <p><strong>Results:</strong> {{calibration.results}}</p>
              <p *ngIf="calibration.certificate"><strong>Certificate:</strong> {{calibration.certificate}}</p>
            </div>
          </div>
        </div>
        <ng-template #noCalibration>
          <p class="no-data">No calibration records found</p>
        </ng-template>
      </section>

      <!-- Notes -->
      <section *ngIf="item.notes">
        <mat-divider></mat-divider>
        <h3>Notes</h3>
        <p>{{item.notes}}</p>
      </section>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 800px;
    }

    mat-dialog-content {
      max-height: 80vh;
    }

    section {
      margin: 24px 0;
    }

    h3 {
      margin: 0 0 16px;
      color: rgba(0, 0, 0, 0.87);
      font-size: 16px;
      font-weight: 500;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      label {
        color: rgba(0, 0, 0, 0.6);
        font-size: 12px;
      }

      span {
        font-size: 14px;
      }
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .history-item {
      background: rgba(0, 0, 0, 0.04);
      border-radius: 4px;
      padding: 16px;

      .history-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .date {
          font-weight: 500;
        }
      }

      .history-content {
        p {
          margin: 4px 0;
          font-size: 14px;
        }
      }
    }

    .no-data {
      color: rgba(0, 0, 0, 0.6);
      font-style: italic;
    }

    mat-divider {
      margin: 24px 0;
    }
  `]
})
export class ViewItemDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public item: Item,
    private dialogRef: MatDialogRef<ViewItemDialogComponent>
  ) {}

  capitalizeStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'inventory':
        return 'primary';
      case 'demo':
        return 'accent';
      case 'delivery':
        return 'warn';
      default:
        return '';
    }
  }
}
