import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductService } from '@core/services/product.service';
import { Product } from '@core/models/product.model';
import { AddProductDialogComponent } from './dialogs/add-product/add-product-dialog.component';
import { EditProductDialogComponent } from './dialogs/edit-product/edit-product-dialog.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatPaginatorModule, 
    MatSortModule, 
    MatInputModule, 
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['sku', 'name', 'model', 'manufacturer', 'category', 'actions'];
  dataSource: MatTableDataSource<Product> = new MatTableDataSource<Product>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private productService: ProductService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        this.dataSource.data = products;
      },
      error: (error: Error) => {
        console.error('Error loading products', error);
        // TODO: Add error handling toast/snackbar
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddProductDialog(): void {
    const dialogRef = this.dialog.open(AddProductDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  editProduct(product: Product): void {
    const dialogRef = this.dialog.open(EditProductDialogComponent, {
      width: '500px',
      data: product
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  deleteProduct(product: Product): void {
    // TODO: Implement confirmation dialog
    this.productService.deleteProduct(product._id || '').subscribe({
      next: () => {
        this.loadProducts();
      },
      error: (error: Error) => {
        console.error('Error deleting product', error);
        // TODO: Add error handling toast/snackbar
      }
    });
  }
}
