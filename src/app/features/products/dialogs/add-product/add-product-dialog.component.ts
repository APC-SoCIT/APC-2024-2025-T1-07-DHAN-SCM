import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '@core/services/product.service';
import { Product } from '@core/models/product.model';

@Component({
  selector: 'app-add-product-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './add-product-dialog.component.html',
  styleUrls: ['./add-product-dialog.component.scss']
})
export class AddProductDialogComponent {
  productForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddProductDialogComponent>,
    private fb: FormBuilder,
    private productService: ProductService
  ) {
    this.productForm = this.fb.group({
      sku: ['', Validators.required],
      name: ['', Validators.required],
      model: ['', Validators.required],
      manufacturer: ['', Validators.required],
      category: ['', Validators.required]
    });
  }

  addProduct(): void {
    if (this.productForm.valid) {
      const newProduct: Product = this.productForm.value;
      this.productService.createProduct(newProduct).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error: Error) => {
          console.error('Error adding product', error);
          // TODO: Add error handling toast/snackbar
        }
      });
    }
  }
}
