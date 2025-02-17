import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { Item } from '../../../core/models/item.interface';

@Component({
  selector: 'app-update-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule
  ],
  template: `
    <h2 mat-dialog-title>Update Status</h2>
    <mat-dialog-content>
      <div class="dialog-content">
        <mat-form-field>
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="selectedStatus">
            <mat-option *ngFor="let status of statuses" [value]="status">
              {{capitalizeStatus(status)}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Notes</mat-label>
          <textarea matInput [(ngModel)]="notes" placeholder="Add notes about this status change..."></textarea>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!selectedStatus">
        Update
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 300px;
      padding: 8px 0;
    }
  `]
})
export class UpdateStatusDialogComponent {
  statuses: Item['status'][] = ['inventory', 'demo', 'delivery', 'maintenance'];
  selectedStatus: Item['status'] = this.data.currentStatus;
  notes: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { currentStatus: Item['status'] },
    private dialogRef: MatDialogRef<UpdateStatusDialogComponent>
  ) {}

  capitalizeStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.selectedStatus) {
      this.dialogRef.close({
        status: this.selectedStatus,
        notes: this.notes
      });
    }
  }
}
