import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Item } from '../../../../core/models/item.interface';

@Component({
  selector: 'app-record-maintenance-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>Record Maintenance</h2>
    <mat-dialog-content>
      <form [formGroup]="maintenanceForm">
        <mat-form-field>
          <mat-label>Type</mat-label>
          <mat-select formControlName="type">
            <mat-option value="preventive">Preventive</mat-option>
            <mat-option value="corrective">Corrective</mat-option>
            <mat-option value="inspection">Inspection</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Describe the maintenance work performed"></textarea>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Performed By</mat-label>
          <input matInput formControlName="performedBy">
        </mat-form-field>

        <mat-form-field>
          <mat-label>Next Due Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="nextDueDate">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Cost</mat-label>
          <input matInput type="number" formControlName="cost" placeholder="Enter maintenance cost">
          <span matTextSuffix>.00</span>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-button color="primary" [disabled]="!maintenanceForm.valid" (click)="onSubmit()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
      margin-bottom: 16px;
    }
    
    textarea {
      min-height: 60px;
    }
  `]
})
export class RecordMaintenanceDialogComponent {
  maintenanceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RecordMaintenanceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item: Item }
  ) {
    // Set next due date to 90 days from now by default
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 90);

    this.maintenanceForm = this.fb.group({
      type: ['preventive', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      performedBy: ['', Validators.required],
      nextDueDate: [nextDueDate, Validators.required],
      cost: [0, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit() {
    if (this.maintenanceForm.valid) {
      const formValue = this.maintenanceForm.value;
      this.dialogRef.close({
        ...formValue,
        nextDueDate: formValue.nextDueDate.toISOString()
      });
    }
  }
}
