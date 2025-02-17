export interface Product {
  _id?: string;
  sku: string;  // Added required SKU field
  name: string;
  model: string;
  manufacturer: string;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}
