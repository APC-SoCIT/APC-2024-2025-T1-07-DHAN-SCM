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
            'email' => 'admin@gmail.com',
            'full_name' => 'Admin User',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        User::create([
            'id' => 2,
            'username' => 'inventory.user',
            'password' => Hash::make('123'),
            'email' => 'inventory.user@gmail.com',
            'full_name' => 'inventory.user',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        User::create([
            'id' => 3,
            'username' => 'sales.user',
            'password' => Hash::make('123'),
            'email' => 'sales.user@gmail.com',
            'full_name' => 'sales.user',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        User::create([
            'id' => 4,
            'username' => 'warehouseman.user',
            'password' => Hash::make('123'),
            'email' => 'warehouseman.user@gmail.com',
            'full_name' => 'warehouseman.user',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        User::create([
            'id' => 5,
            'username' => 'logistic.user',
            'password' => Hash::make('123'),
            'email' => 'logistic.user@gmail.com',
            'full_name' => 'logistic.user',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        User::create([
            'id' => 6,
            'username' => 'customer1.user',
            'password' => Hash::make('123'),
            'email' => 'customer1.user@gmail.com',
            'full_name' => 'customer1.user',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        User::create([
            'id' => 7,
            'username' => 'customer2.user',
            'password' => Hash::make('123'),
            'email' => 'customer2.user@gmail.com',
            'full_name' => 'customer2.user',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        User::create([
            'id' => 8,
            'username' => 'finance.user',
            'password' => Hash::make('123'),
            'email' => 'finance.user@gmail.com',
            'full_name' => 'finance.user',
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
            ['id' => 8, 'name' => 'Logistic Manager', 'description' => 'Logistic Manager', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['id' => 9, 'name' => 'Customer', 'description' => 'Customer', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['id' => 10, 'name' => 'Finance', 'description' => 'Finance', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
        ]);
        
        DB::table('role_users')->insert([
            ['user_id' => 1, 'role_id' => 1, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['user_id' => 2, 'role_id' => 2, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['user_id' => 3, 'role_id' => 3, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['user_id' => 4, 'role_id' => 6, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['user_id' => 5, 'role_id' => 8, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['user_id' => 6, 'role_id' => 9, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['user_id' => 7, 'role_id' => 9, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['user_id' => 8, 'role_id' => 10, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
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
            ['id' => 33, 'name' => 'For Receiving', 'description' => 'For Receiving', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 34, 'name' => 'Ready to Deliver', 'description' => 'Ready to Deliver', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 35, 'name' => 'In-Transit', 'description' => 'In-transit', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 36, 'name' => 'Draft', 'description' => 'Draft', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()]
        ];

        foreach ($statuses as $status) {
            Status::create($status);
        }
            

         // Seed companies
         Company::create(['id' => 1, 'name' => 'Makati medical hospital', 'contact_info' => 'Makati', 'website_url' => 'https://company1.com', 'industry' => 'Industry 1', 'address' => '123 Company St.', 'city' => 'City 1', 'country' => 'Country 1', 'zip_code' => '12345', 'phone_number' => '123-456-7890', 'email_address' => 'contact@company1.com', 'primary_contact_name' => 'John Smith', 'primary_contact_phone' => '123-456-7890', 'primary_contact_email' => 'john.smith@company1.com', 'additional_info' => '{}', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()]);
            Company::create(['id' => 2, 'name' => 'Calamba medical hospital', 'contact_info' => 'Calamba laguna', 'website_url' => 'https://company2.com', 'industry' => 'Industry 2', 'address' => '456 Company Ave.', 'city' => 'City 2', 'country' => 'Country 2', 'zip_code' => '67890', 'phone_number' => '987-654-3210', 'email_address' => 'contact@company2.com', 'primary_contact_name' => 'Jane Doe', 'primary_contact_phone' => '987-654-3210', 'primary_contact_email' => 'jane.doe@company2.com', 'additional_info' => '{}', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()]);
    
                CompanyUser::create([
                    'company_id' => 1,
                    'user_id' =>6,
                ]);
                
                CompanyUser::create([
                    'company_id' => 2,
                    'user_id' =>7,
                ]);
                
          // Seed warehouses
          Warehouse::create(['id' => 1, 'name' => 'Default warehouse', 'address' => '123 Warehouse St.', 'created_by' => 1, 'updated_by' => 1, 'created_at' => now(), 'updated_at' => now()]);


          // Run CSV Import for Products
        Artisan::call('import:csv', ['file' => storage_path('app/products.csv')]);
        $this->command->info('CSV Products Import executed successfully!');

        // Run CSV Import for Orders
        Artisan::call('import:csvorders', ['file' => storage_path('app/orders.csv')]);
        $this->command->info('CSV Orders Import executed successfully!');






    
    }
}
