import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Item } from '../../../../core/models/item.interface';

@Component({
  selector: 'app-record-calibration-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>Record Calibration</h2>
    <mat-dialog-content>
      <form [formGroup]="calibrationForm">
        <mat-form-field>
          <mat-label>Notes</mat-label>
          <textarea matInput formControlName="notes" rows="3" placeholder="Describe the calibration process and findings"></textarea>
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
          <mat-label>Results</mat-label>
          <textarea matInput formControlName="results" rows="3" placeholder="Enter calibration results and measurements"></textarea>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Certificate Number</mat-label>
          <input matInput formControlName="certificate">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-button color="primary" [disabled]="!calibrationForm.valid" (click)="onSubmit()">Save</button>
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
export class RecordCalibrationDialogComponent {
  calibrationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RecordCalibrationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item: Item }
  ) {
    // Set next due date to 180 days from now by default
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 180);

    this.calibrationForm = this.fb.group({
      notes: ['', [Validators.required, Validators.minLength(10)]],
      performedBy: ['', Validators.required],
      nextDueDate: [nextDueDate, Validators.required],
      results: ['', [Validators.required, Validators.minLength(10)]],
      certificate: ['', Validators.pattern('^[A-Za-z0-9-]+$')]
    });
  }

  onSubmit() {
    if (this.calibrationForm.valid) {
      const formValue = this.calibrationForm.value;
      const data = {
        ...formValue,
        nextDueDate: formValue.nextDueDate.toISOString(),
        date: new Date().toISOString()
      };
      console.log('Submitting calibration data:', data);
      this.dialogRef.close(data);
    }
  }
}
