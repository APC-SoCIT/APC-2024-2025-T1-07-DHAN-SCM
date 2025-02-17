import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatChipListboxChange, MatChipRow } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Item } from '../../../../core/models/item.interface';

interface MaintenanceRecord {
  date: Date;
  type: string;
  description: string;
  performedBy: string;
  nextDueDate?: Date;
  cost?: number;
  attachments?: string[];
}

interface CalibrationRecord {
  date: Date;
  notes: string;
  performedBy: string;
  nextDueDate: Date;
  results: string;
  certificate?: string;
}

interface WarrantyClaim {
  date: Date;
  description: string;
  status: string;
  resolution: string;
}

@Component({
  selector: 'app-view-history-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './view-history-dialog.component.html',
  styleUrls: ['./view-history-dialog.component.scss']
})
export class ViewHistoryDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public item: Item & {
      maintenanceHistory?: MaintenanceRecord[];
      calibrationHistory?: CalibrationRecord[];
      warranty?: {
        claimHistory?: WarrantyClaim[];
      };
    },
    private dialogRef: MatDialogRef<ViewHistoryDialogComponent>
  ) {}

  get sortedMaintenanceHistory(): MaintenanceRecord[] {
    if (!this.item?.maintenanceHistory) return [];
    return [...this.item.maintenanceHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  get sortedCalibrationHistory(): CalibrationRecord[] {
    if (!this.item?.calibrationHistory) return [];
    return [...this.item.calibrationHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  get sortedWarrantyClaims(): WarrantyClaim[] {
    if (!this.item?.warranty?.claimHistory) return [];
    return [...this.item.warranty.claimHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  getClaimStatusColor(status: string): 'primary' | 'accent' | 'warn' | undefined {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warn';
      case 'approved':
        return 'primary';
      case 'rejected':
        return 'warn';
      case 'resolved':
        return 'accent';
      default:
        return undefined;
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
