import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '@core/services/product.service';
import { Product } from '@core/models/product.model';

@Component({
  selector: 'app-edit-product-dialog',
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
  templateUrl: './edit-product-dialog.component.html',
  styleUrls: ['./edit-product-dialog.component.scss']
})
export class EditProductDialogComponent {
  productForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public product: Product,
    private fb: FormBuilder,
    private productService: ProductService
  ) {
    this.productForm = this.fb.group({
      _id: [product._id],
      sku: [product.sku, Validators.required],
      name: [product.name, Validators.required],
      model: [product.model, Validators.required],
      manufacturer: [product.manufacturer, Validators.required],
      category: [product.category, Validators.required]
    });
  }

  updateProduct(): void {
    if (this.productForm.valid) {
      const updatedProduct: Product = this.productForm.value;
      this.productService.updateProduct(updatedProduct).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error: Error) => {
          console.error('Error updating product', error);
          // TODO: Add error handling toast/snackbar
        }
      });
    }
  }
}
