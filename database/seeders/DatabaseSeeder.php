<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Tag;
use App\Models\Role;
use App\Models\User;
use App\Models\Order;
use App\Models\Status;
use App\Models\Billing;
use App\Models\Company;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\Location;
use App\Models\RoleUser;
use App\Models\Supplier;
use App\Models\OrderItem;
use App\Models\Warehouse;
use App\Models\ProductTag;
use App\Models\CompanyUser;
use App\Models\ProductType;
use App\Models\ProductUnit;
use Illuminate\Support\Str;
use App\Models\ProductGroup;
use App\Models\PurchaseOrder;
use App\Models\InsuranceClaim;
use Illuminate\Support\Carbon;


use App\Imports\ProductsImport;
use App\Models\ProductCategory;
use App\Models\SupplierProduct;
use Illuminate\Database\Seeder;
use App\Models\OrderItemPayment;
use App\Models\CalibrationRecord;
use App\Models\MaintenanceRecord;
use App\Models\PurchaseOrderItem;
use App\Models\InventoryEquipment;
use App\Models\PaymentTransaction;
use Illuminate\Support\Facades\DB;


use App\Models\InventoryConsumable;
use App\Models\PurchaseOrderStatus;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Facades\Excel;



use Illuminate\Support\Facades\Artisan;



class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        
        // Seed users
        User::create([
            'id' => 1,
            'username' => 'admin',
            'password' => Hash::make('123'),
            'email' => 'admin@admin.com',
            'full_name' => 'Admin User',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        User::create([
            'id' => 2,
            'username' => 'jdoe',
            'password' => Hash::make('hashedpassword2'),
            'email' => 'jdoe@example.com',
            'full_name' => 'John Doe',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        User::create([
            'id' => 3,
            'username' => 'asmith',
            'password' => Hash::make('hashedpassword3'),
            'email' => 'asmith@example.com',
            'full_name' => 'Alice Smith',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

    
        DB::table('roles')->insert([
            ['id' => 1, 'name' => 'Admin', 'description' => 'Administrator with full access to the system', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['id' => 2, 'name' => 'Inventory Manager', 'description' => 'Manages inventory and oversees stock levels', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['id' => 3, 'name' => 'Sales Manager', 'description' => 'Handles sales operations and customer relations', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['id' => 4, 'name' => 'Maintenance Staff', 'description' => 'Responsible for maintenance and equipment upkeep', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['id' => 5, 'name' => 'Supplier', 'description' => 'External supplier with restricted access', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['id' => 6, 'name' => 'Warehouse Staff', 'description' => 'Handles warehouse operations and inventory movement', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['id' => 7, 'name' => 'User', 'description' => 'General user with limited access', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
        ]);
        
        DB::table('role_users')->insert([
            ['user_id' => 1, 'role_id' => 1, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['user_id' => 2, 'role_id' => 1, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['user_id' => 3, 'role_id' => 1, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            // Add more role-user relationships as needed
        ]);
        

        $statuses = [
            ['id' => 1, 'name' => 'Pending', 'description' => 'Awaiting approval', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Approved', 'description' => 'Approved for use', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Rejected', 'description' => 'Not approved for use', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'name' => 'Active', 'description' => 'Currently active and in use', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'name' => 'Inactive', 'description' => 'Not currently in use', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'name' => 'Pending Approval', 'description' => 'Awaiting further approval', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'name' => 'Ordered', 'description' => 'Order has been placed', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8, 'name' => 'Received', 'description' => 'Order has been received', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 9, 'name' => 'Processing', 'description' => 'Order is being processed', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 10, 'name' => 'Shipped', 'description' => 'Order has been shipped', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 11, 'name' => 'Delivered', 'description' => 'Order has been delivered', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 12, 'name' => 'Cancelled', 'description' => 'Order has been cancelled', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 13, 'name' => 'Returned', 'description' => 'Order has been returned', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 14, 'name' => 'Paid', 'description' => 'Payment has been made', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 15, 'name' => 'Partially Paid', 'description' => 'Partial payment has been made', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 16, 'name' => 'Overdue', 'description' => 'Payment is overdue', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 17, 'name' => 'Refunded', 'description' => 'Payment has been refunded', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 18, 'name' => 'Written Off', 'description' => 'Payment has been written off', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 19, 'name' => 'In Stock', 'description' => 'Item is in stock', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 20, 'name' => 'Out of Stock', 'description' => 'Item is out of stock', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 21, 'name' => 'Under Maintenance', 'description' => 'Item is under maintenance', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 22, 'name' => 'Decommissioned', 'description' => 'Item is decommissioned', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 23, 'name' => 'Scheduled', 'description' => 'Scheduled for action', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 24, 'name' => 'In Progress', 'description' => 'Action is in progress', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 25, 'name' => 'Overdue', 'description' => 'Action is overdue', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 26, 'name' => 'Demo', 'description' => 'Equipment on demo', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 27, 'name' => 'Purchased', 'description' => 'Equipment purchased after demo', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 28, 'name' => 'Demo Returned', 'description' => 'Demo equipment returned', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 29, 'name' => 'Return Demo (working)', 'description' => 'Equipment demo tested and ready to sell', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 30, 'name' => 'Return Demo (not working)', 'description' => 'Equipment demo tested and ready to sell', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 31, 'name' => 'Partially Received', 'description' => 'Order has been partially received', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 32, 'name' => 'Completed', 'description' => 'Completed', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 33, 'name' => 'For Recieving', 'description' => 'For Recieving', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()]
        ];

        foreach ($statuses as $status) {
            Status::create($status);
        }
            

         // Seed companies
         Company::create(['id' => 1, 'name' => 'Company 1', 'contact_info' => 'Contact info for company 1', 'website_url' => 'https://company1.com', 'industry' => 'Industry 1', 'address' => '123 Company St.', 'city' => 'City 1', 'country' => 'Country 1', 'zip_code' => '12345', 'phone_number' => '123-456-7890', 'email_address' => 'contact@company1.com', 'primary_contact_name' => 'John Smith', 'primary_contact_phone' => '123-456-7890', 'primary_contact_email' => 'john.smith@company1.com', 'additional_info' => '{}', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()]);
            Company::create(['id' => 2, 'name' => 'Company 2', 'contact_info' => 'Contact info for company 2', 'website_url' => 'https://company2.com', 'industry' => 'Industry 2', 'address' => '456 Company Ave.', 'city' => 'City 2', 'country' => 'Country 2', 'zip_code' => '67890', 'phone_number' => '987-654-3210', 'email_address' => 'contact@company2.com', 'primary_contact_name' => 'Jane Doe', 'primary_contact_phone' => '987-654-3210', 'primary_contact_email' => 'jane.doe@company2.com', 'additional_info' => '{}', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()]);
    
                CompanyUser::create([
                    'company_id' => 1,
                    'user_id' =>1,
                ]);
                
          // Seed warehouses
          Warehouse::create(['id' => 1, 'name' => 'Default warehouse', 'address' => '123 Warehouse St.', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()]);


           // Run the CSV import command
           Artisan::call('import:csv', ['file' => storage_path('app/products.csv')]);
          
           $this->command->info('CSV Import Seeder executed successfully!');



    /*
        
        $units = [
            ['name' => 'Piece', 'abbreviation' => 'pc', 'description' => 'Single unit of an item'],
            ['name' => 'Box', 'abbreviation' => 'bx', 'description' => 'Packaging containing multiple items'],
            ['name' => 'Carton', 'abbreviation' => 'ctn', 'description' => 'Bulk packaging containing several boxes'],
            ['name' => 'Liter', 'abbreviation' => 'L', 'description' => 'Volume measurement for liquids like disinfectants'],
            ['name' => 'Milliliter', 'abbreviation' => 'mL', 'description' => 'Small liquid measurement used for medications'],
            ['name' => 'Kilogram', 'abbreviation' => 'kg', 'description' => 'Weight measurement for bulk powders or drugs'],
            ['name' => 'Gram', 'abbreviation' => 'g', 'description' => 'Weight measurement for smaller quantities of powders'],
            ['name' => 'Pack', 'abbreviation' => 'pk', 'description' => 'Pack containing grouped medical items'],
            ['name' => 'Set', 'abbreviation' => 'st', 'description' => 'Set of bundled items such as surgical instruments'],
            ['name' => 'Bottle', 'abbreviation' => 'btl', 'description' => 'Container used for liquids or medications'],
            ['name' => 'Litter', 'abbreviation' => 'L', 'description' => 'Volume measurement for liquids like water and disinfectants'], // Duplicate of Liter corrected below if "litter" was a mistake
            ['name' => 'Milliliter Extended', 'abbreviation' => 'mlx', 'description' => 'Alternate abbreviation for milliliter'],
        ];

        foreach ($units as $unit) {
            ProductUnit::create($unit);
        }

        $tags = [
            ['name' => 'REAGENT'],
            ['name' => 'CALIBRATOR'],
            ['name' => 'CONTROL'],
            ['name' => 'MACHINE'],
            ['name' => 'PARTS/CONS'],
        ];

        foreach ($tags as $tag) {
            Tag::create($tag);
        }





        // Seed locations
        Location::create(['id' => 1, 'name' => 'Main Warehouse', 'description' => 'Primary storage location', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()]);
        Location::create(['id' => 2, 'name' => 'Secondary Warehouse', 'description' => 'Secondary storage location', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()]);

        // Seed warehouses
        Warehouse::create(['id' => 1, 'name' => 'Warehouse A', 'address' => '123 Warehouse St.', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()]);
        Warehouse::create(['id' => 2, 'name' => 'Warehouse B', 'address' => '456 Warehouse Ave.', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()]);

       
      
        // Seed suppliers
        Supplier::create(['id' => 1, 'name' => 'URIT', 'contact_info' => 'URIT', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()]);
        Supplier::create(['id' => 2, 'name' => 'BIOBASE', 'contact_info' => 'BIOBASE', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()]);
        Supplier::create(['id' => 3, 'name' => 'EDAN', 'contact_info' => 'EDAN', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()]);


        // Seed companies
        Company::create(['id' => 1, 'name' => 'Company 1', 'contact_info' => 'Contact info for company 1', 'website_url' => 'https://company1.com', 'industry' => 'Industry 1', 'address' => '123 Company St.', 'city' => 'City 1', 'country' => 'Country 1', 'zip_code' => '12345', 'phone_number' => '123-456-7890', 'email_address' => 'contact@company1.com', 'primary_contact_name' => 'John Smith', 'primary_contact_phone' => '123-456-7890', 'primary_contact_email' => 'john.smith@company1.com', 'additional_info' => '{}', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()]);
        Company::create(['id' => 2, 'name' => 'Company 2', 'contact_info' => 'Contact info for company 2', 'website_url' => 'https://company2.com', 'industry' => 'Industry 2', 'address' => '456 Company Ave.', 'city' => 'City 2', 'country' => 'Country 2', 'zip_code' => '67890', 'phone_number' => '987-654-3210', 'email_address' => 'contact@company2.com', 'primary_contact_name' => 'Jane Doe', 'primary_contact_phone' => '987-654-3210', 'primary_contact_email' => 'jane.doe@company2.com', 'additional_info' => '{}', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()]);

            CompanyUser::create([
                'company_id' => 1,
                'user_id' =>1,
            ]);

            $products = [
                [
                    'name' => ' Detergent A URIT D11  (5L)',
                    'sku' => strtoupper(substr(' Detergent A URIT D11  (5L)', 0, 4)) . strtoupper(Str::random(4)),
                    'model' => 'US-500',
                    'description' => 'High-quality chemical reagent for laboratory testing.',
                    'product_unit_id' => 10,
                    'minimum_quantity' => 10,
                    'profit_margin' => 2,
                    'supplier_id' => 1,
                    'supplier_price' => 500.00,
                    'location_id' => 1,
                    'warehouse_id' => 1,
                    'status_id' => 1,
                    'created_by' => 1,
                    'updated_by' => 1
                ],
                [
                    'name' => 'Alkaline Detergent DC-1',
                    'sku' => strtoupper(substr('Alkaline Detergent DC-1', 0, 4)) . strtoupper(Str::random(4)),
                    'model' => 'URIT-8210',
                    'description' => 'High-quality chemical reagent for laboratory testing.',
                    'product_unit_id' => 10,
                    'minimum_quantity' => 10,
                    'profit_margin' => 2,
                    'supplier_id' => 1,
                    'supplier_price' => 500.00,
                    'location_id' => 1,
                    'warehouse_id' => 1,
                    'status_id' => 1,
                    'created_by' => 1,
                    'updated_by' => 1
                ],
                [
                    'name' => 'Control Solution C',
                    'sku' => strtoupper(substr('Control Solution C', 0, 4)) . strtoupper(Str::random(4)),
                    'model' => 'CS-CX',
                    'description' => 'Solution used for maintaining equipment accuracy.',
                    'product_unit_id' => 10,
                    'minimum_quantity' => 10,
                    'profit_margin' => 2,
                    'supplier_id' => 1,
                    'supplier_price' => 500.00,
                    'location_id' => 1,
                    'warehouse_id' => 1,
                    'status_id' => 1,
                    'created_by' => 1,
                    'updated_by' => 1
                ],
                [
                    'name' => 'Industrial Machine X',
                    'sku' => strtoupper(substr('Industrial Machine X', 0, 4)) . strtoupper(Str::random(4)),
                    'model' => 'IM-X500',
                    'description' => 'Heavy-duty industrial machine for automated processes.',
                    'product_unit_id' => 10,
                    'minimum_quantity' => 10,
                    'profit_margin' => 2,
                    'supplier_id' => 1,
                    'supplier_price' => 500.00,
                    'location_id' => 1,
                    'warehouse_id' => 1,
                    'status_id' => 1,
                    'created_by' => 1,
                    'updated_by' => 1
                ],
                [
                    'name' => 'Machine Parts Set Y',
                    'sku' => strtoupper(substr('Machine Parts Set Y', 0, 4)) . strtoupper(Str::random(4)),
                    'model' => 'MP-Y234',
                    'description' => 'Essential parts set for maintenance.',
                    'product_unit_id' => 10,
                    'minimum_quantity' => 10,
                    'profit_margin' => 2,
                    'supplier_id' => 1,
                    'supplier_price' => 500.00,
                    'location_id' => 1,
                    'warehouse_id' => 1,
                    'status_id' => 1,
                    'created_by' => 1,
                    'updated_by' => 1
                ],
                [
                    'name' => 'EDANSD6',
                    'sku' => strtoupper(substr('EDANSD6', 0, 4)) . strtoupper(Str::random(4)),
                    'model' => 'SD6',
                    'description' => 'EDAN',
                    'product_unit_id' => 1,
                    'minimum_quantity' => 3,
                    'profit_margin' => 5,
                    'is_machine' => 1,
                    'supplier_id' => 1,
                    'supplier_price' => 5000000.00,
                    'location_id' => 1,
                    'warehouse_id' => 1,
                    'status_id' => 1,
                    'created_by' => 1,
                    'updated_by' => 1
                ],
            ];
    
            foreach ($products as $product) {
                Product::create($product);
            }

            
        $productTags = [
            ['product_id' => 1 , 'tag_id' => 1],
            ['product_id' => 2 , 'tag_id' => 1],
            ['product_id' => 3 , 'tag_id' => 2],
            ['product_id' => 4 , 'tag_id' => 3],
            ['product_id' => 5 , 'tag_id' => 4],
            ['product_id' => 6, 'tag_id' => 4],
        ];

        foreach ($productTags as $productTag) {
            ProductTag::create($productTag);
        }
    



            

        // Seed purchase orders (continued)
        PurchaseOrder::create([
            'id' => 1,
            'supplier_id' => 1,
            'order_date' => '2025-03-10',
            'total_amount' => 1000.00,
            'status_id' => 1,
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        PurchaseOrder::create([
            'id' => 2,
            'supplier_id' => 2,
            'order_date' => '2025-03-11',
            'total_amount' => 1000.00,
            'status_id' => 1,
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed purchase_order_statuses
        PurchaseOrderStatus::create([
            'id' => 1,
            'purchase_order_id' => 1,
            'status_id' => 1,
            'status_date' => now(),
            'comments' => null,
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        PurchaseOrderStatus::create([
            'id' => 2,
            'purchase_order_id' => 2,
            'status_id' => 1,
            'status_date' => now(),
            'comments' => null,
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed purchase_order_items
        PurchaseOrderItem::create([
            'id' => 1,
            'purchase_order_id' => 1,
            'product_id' => 1,
            'quantity' => 10,
            'unit_price' => 500.00,
            'total_price' => 1000.00,
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        PurchaseOrderItem::create([
            'id' => 2,
            'purchase_order_id' => 2,
            'product_id' => 2,
            'quantity' => 2,
            'unit_price' => 500.00,
            'total_price' => 1000.00,
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        //MACHINE
        PurchaseOrder::create([
            'id' => 3,
            'supplier_id' => 3,
            'order_date' => '2025-03-10',
            'total_amount' => 10000000.00,
            'status_id' => 1,
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        PurchaseOrderStatus::create([
            'id' => 3,
            'purchase_order_id' => 3,
            'status_id' => 1,
            'status_date' => now(),
            'comments' => null,
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        PurchaseOrderItem::create([
            'id' => 3,
            'purchase_order_id' => 3,
            'product_id' => 6,
            'quantity' => 2,
            'unit_price' => 5000000.00,
            'total_price' => 10000000.00,
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

    */

      /*
        // Seed orders
        Order::create([
            'id' => 1,
            'company_id' => 1,
            'order_date' => '2025-03-10',
            'total_amount' => 150.00,
            'status_id' => 1,
            'payment_status_id' => 1,
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Order::create([
            'id' => 2,
            'company_id' => 2,
            'order_date' => '2025-03-11',
            'total_amount' => 250.00,
            'status_id' => 1,
            'payment_status_id' => 1,
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed order_items
       /* OrderItem::create([
            'id' => 1,
            'order_id' => 1,
            'product_id' => 1,
            'quantity' => 10,
            'unit_price' => 15.00,
            'total_price' => 150.00,
            'amount_paid' => 75.00,
            'remaining_balance' => 75.00,
            'inventory_equipment_id' => 1,
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        OrderItem::create([
            'id' => 2,
            'order_id' => 2,
            'product_id' => 2,
            'quantity' => 5,
            'unit_price' => 25.00,
            'total_price' => 125.00,
            'amount_paid' => 50.00,
            'remaining_balance' => 75.00,
            'inventory_equipment_id' => 2,
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed maintenance_records
        MaintenanceRecord::create([
            'id' => 1,
            'inventory_equipment_id' => 1,
            'maintenance_date' => '2025-03-10',
            'description' => 'Routine check',
            'performed_by' => 'Technician 1',
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        MaintenanceRecord::create([
            'id' => 2,
            'inventory_equipment_id' => 2,
            'maintenance_date' => '2025-03-11',
            'description' => 'Repair',
            'performed_by' => 'Technician 2',
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed calibration_records
        CalibrationRecord::create([
            'id' => 1,
            'inventory_equipment_id' => 1,
            'calibration_date' => '2025-03-10',
            'next_calibration_due' => '2026-03-10',
            'calibrated_by' => 'Calibrator 1',
            'calibration_status_id' => 1,
            'calibration_notes' => 'Calibrated successfully',
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        CalibrationRecord::create([
            'id' => 2,
            'inventory_equipment_id' => 2,
            'calibration_date' => '2025-03-11',
            'next_calibration_due' => '2026-03-11',
            'calibrated_by' => 'Calibrator 2',
            'calibration_status_id' => 1,
            'calibration_notes' => 'Calibrated successfully',
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed insurance_claims (continued)
        InsuranceClaim::create([
            'id' => 1,
            'inventory_equipment_id' => 1,
            'claim_date' => '2025-03-10',
            'incident_description' => 'Incident 1',
            'claim_amount' => 1000.00,
            'approved_amount' => 900.00,
            'claim_status_id' => 1,
            'insurer_name' => 'Insurer 1',
            'policy_number' => 'POLICY001',
            'settlement_date' => '2025-03-20',
            'remarks' => 'Approved',
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        InsuranceClaim::create([
            'id' => 2,
            'inventory_equipment_id' => 2,
            'claim_date' => '2025-03-11',
            'incident_description' => 'Incident 2',
            'claim_amount' => 2000.00,
            'approved_amount' => 1800.00,
            'claim_status_id' => 1,
            'insurer_name' => 'Insurer 2',
            'policy_number' => 'POLICY002',
            'settlement_date' => '2025-03-21',
            'remarks' => 'Approved',
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed billings
        Billing::create([
            'id' => 1,
            'order_id' => 1,
            'billing_date' => '2025-03-10',
            'due_date' => '2025-04-10',
            'total_amount' => 150.00,
            'amount_paid' => 75.00,
            'remaining_balance' => 75.00,
            'status_id' => 1,
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Billing::create([
            'id' => 2,
            'order_id' => 2,
            'billing_date' => '2025-03-11',
            'due_date' => '2025-04-11',
            'total_amount' => 250.00,
            'amount_paid' => 125.00,
            'remaining_balance' => 125.00,
            'status_id' => 1,
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed payment_transactions
        PaymentTransaction::create([
            'id' => 1,
            'billing_id' => 1,
            'payment_date' => '2025-03-10',
            'amount_paid' => 75.00,
            'payment_method' => 'Credit Card',
            'is_pdc' => false,
            'cheque_clearance_date' => null,
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        PaymentTransaction::create([
            'id' => 2,
            'billing_id' => 2,
            'payment_date' => '2025-03-11',
            'amount_paid' => 125.00,
            'payment_method' => 'Bank Transfer',
            'is_pdc' => false,
            'cheque_clearance_date' => null,
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed order_item_payments
        OrderItemPayment::create([
            'id' => 1,
            'payment_transaction_id' => 1,
            'order_item_id' => 1,
            'payment_date' => '2025-03-10',
            'amount_paid' => 75.00,
            'remarks' => 'Partial payment',
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        OrderItemPayment::create([
            'id' => 2,
            'payment_transaction_id' => 2,
            'order_item_id' => 2,
            'payment_date' => '2025-03-11',
            'amount_paid' => 125.00,
            'remarks' => 'Partial payment',
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed invoices
        Invoice::create([
            'id' => 1,
            'order_id' => 1,
            'billing_id' => 1,
            'invoice_date' => '2025-03-10',
            'due_date' => '2025-04-10',
            'total_amount' => 150.00,
            'status_id' => 1,
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Invoice::create([
            'id' => 2,
            'order_id' => 2,
            'billing_id' => 2,
            'invoice_date' => '2025-03-11',
            'due_date' => '2025-04-11',
            'total_amount' => 250.00,
            'status_id' => 1,
            'created_by' => 1,
            'updated_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        */

       
    }
}
