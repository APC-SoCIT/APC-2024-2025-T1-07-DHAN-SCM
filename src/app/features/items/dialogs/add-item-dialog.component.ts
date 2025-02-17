import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { Item } from '../../../core/models/item.interface';
import { ProductService, Product } from '@core/services/product.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-add-item-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>Add New Item</h2>
    <mat-dialog-content>
      <form [formGroup]="itemForm">
        <mat-form-field appearance="fill">
          <mat-label>Serial Number</mat-label>
          <input matInput formControlName="serialNumber" required>
          <mat-error *ngIf="itemForm.get('serialNumber')?.hasError('required')">
            Serial number is required
          </mat-error>
          <mat-error *ngIf="itemForm.get('serialNumber')?.hasError('minlength')">
            Serial number must be at least 3 characters
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Product</mat-label>
          <mat-select formControlName="productId" required>
            <mat-option *ngFor="let product of products" [value]="product._id">
              {{ product.name }} - {{ product.model }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="itemForm.get('productId')?.hasError('required')">
            Product is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status" required>
            <mat-option value="inventory">In Inventory</mat-option>
            <mat-option value="demo">In Demo</mat-option>
            <mat-option value="delivery">In Delivery</mat-option>
          </mat-select>
          <mat-error *ngIf="itemForm.get('status')?.hasError('required')">
            Status is required
          </mat-error>
        </mat-form-field>

        <h3 class="section-title">Purchase Information</h3>

        <mat-form-field appearance="fill">
          <mat-label>Purchase Date</mat-label>
          <input matInput [matDatepicker]="purchasePicker" formControlName="purchaseDate" required>
          <mat-datepicker-toggle matSuffix [for]="purchasePicker"></mat-datepicker-toggle>
          <mat-datepicker #purchasePicker></mat-datepicker>
          <mat-error *ngIf="itemForm.get('purchaseDate')?.hasError('required')">
            Purchase date is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Purchase Cost</mat-label>
          <input matInput type="number" formControlName="purchaseCost">
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Supplier</mat-label>
          <input matInput formControlName="purchaseSupplier">
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Order Reference</mat-label>
          <input matInput formControlName="purchaseOrderRef">
        </mat-form-field>

        <h3 class="section-title">Warranty Information</h3>

        <mat-form-field appearance="fill">
          <mat-label>Warranty Start Date</mat-label>
          <input matInput [matDatepicker]="startPicker" formControlName="warrantyStartDate">
          <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Warranty End Date</mat-label>
          <input matInput [matDatepicker]="endPicker" formControlName="warrantyEndDate">
          <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Warranty Provider</mat-label>
          <input matInput formControlName="warrantyProvider">
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Warranty Terms</mat-label>
          <textarea matInput formControlName="warrantyTerms" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="!itemForm.valid">
        Add Item
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .section-title {
      margin: 16px 0 8px;
      color: rgba(0, 0, 0, 0.87);
      font-size: 14px;
      font-weight: 500;
    }
    :host {
      display: block;
      width: 100%;
      max-width: 500px;
    }

    mat-dialog-content {
      padding-top: 20px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    mat-form-field {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 16px 0;
    }
  `]
})
export class AddItemDialogComponent implements OnInit, OnDestroy {
  itemForm: FormGroup;
  products: Product[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddItemDialogComponent>,
    private productService: ProductService
  ) {
    const currentDate = new Date();
    this.itemForm = this.fb.group({
      serialNumber: ['', [Validators.required, Validators.minLength(3)]],
      productId: ['', Validators.required],
      status: ['inventory', Validators.required],
      purchaseDate: [currentDate, Validators.required],
      purchaseCost: [null],
      purchaseSupplier: [''],
      purchaseOrderRef: [''],
      warrantyStartDate: [null],
      warrantyEndDate: [null],
      warrantyProvider: [''],
      warrantyTerms: ['']
    });

    // Make warranty end date required when start date is set
    this.itemForm.get('warrantyStartDate')?.valueChanges.subscribe(startDate => {
      const endDateControl = this.itemForm.get('warrantyEndDate');
      if (startDate) {
        endDateControl?.setValidators([Validators.required]);
      } else {
        endDateControl?.clearValidators();
      }
      endDateControl?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    this.productService.getAllProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.products = products;
        },
        error: (error) => {
          console.error('Error loading products:', error);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit() {
    if (this.itemForm.valid) {
      const formValue = this.itemForm.value;
      console.log('Form values:', formValue);
      
      // Build the item object matching the server's expected format
      // Convert form date (local) to UTC date
      const purchaseDate = formValue.purchaseDate;
      console.log('Purchase date from form:', purchaseDate);
      console.log('Purchase date type:', Object.prototype.toString.call(purchaseDate));

      type ItemData = {
        serialNumber: string;
        productId: string;
        status: string;
        purchaseInfo: {
          date: Date;
          cost: number;
          supplier: string;
          orderReference: string;
        };
        warranty?: {
          startDate: Date;
          endDate: Date;
          claimHistory: Array<{
            date: Date;
            description: string;
            status: string;
            resolution: string;
          }>;
        };
      };

      const item: ItemData = {
        serialNumber: formValue.serialNumber,
        productId: formValue.productId,
        status: formValue.status,
        purchaseInfo: {
          date: purchaseDate,  // Use the date from the form
          cost: formValue.purchaseCost ? Number(formValue.purchaseCost) : 0,
          supplier: formValue.purchaseSupplier || '',
          orderReference: formValue.purchaseOrderRef || ''
        }
      };

      // Only add warranty if start date is provided
      if (formValue.warrantyStartDate && formValue.warrantyEndDate) {
        item.warranty = {
          startDate: new Date(formValue.warrantyStartDate),
          endDate: new Date(formValue.warrantyEndDate),
          claimHistory: []  // Required by schema
        };
      }

      // For debugging
      console.log('Submitting item:', JSON.stringify(item, null, 2));

      this.dialogRef.close(item);
    }
  }
}
