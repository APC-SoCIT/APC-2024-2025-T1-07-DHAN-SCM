<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use App\Models\Role;
use App\Models\User;
use App\Models\Order;
use App\Models\Status;
use League\Csv\Reader;
use App\Models\Company;
use App\Models\Product;
use App\Models\RoleUser;
use App\Models\Supplier;
use App\Models\OrderItem;
use App\Models\CompanyUser;
use App\Models\OrderStatus;
use App\Models\IncomingStock;
use App\Models\OutgoingStock;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use App\Models\OrderTemporaryAllocation;

class ImportCSVOrders extends Command
{
    protected $signature = 'import:csvorders {file}';
    protected $description = 'Import orders from a CSV file';

    public function handle(): void
    {
        $filePath = $this->argument('file');

        if (!file_exists($filePath)) {
            Log::error("File not found: $filePath");
            $this->error("File not found: $filePath");
            return;
        }

        Log::info("Starting CSV Import: $filePath");

        try {
            $csv = Reader::createFromPath($filePath, 'r');
            $csv->setHeaderOffset(0);
        } catch (\Exception $e) {
            Log::error("Error reading CSV file: " . $e->getMessage());
            $this->error("Error reading CSV file: " . $e->getMessage());
            return;
        }

        DB::transaction(function () use ($csv) {
            foreach ($csv as $record) {

                if (empty($record['customer']) || empty($record['user']) || empty($record['product_id']) || empty($record['quantity'])) {
                    Log::warning("Skipping row due to missing data: " . json_encode($record));
                    continue;
                }

                // Convert Order Date Format (Fix for MariaDB)
                try {
                    $orderDate = Carbon::createFromFormat('d/m/Y', trim($record['order_date']))->format('Y-m-d');
                } catch (\Exception $e) {
                    Log::warning("Invalid date format: " . $record['order_date']);
                    continue;
                }

                // Step 1: Find or Create Company
                $company = Company::firstOrCreate(
                    ['name' => trim($record['customer'])],
                    ['created_by' => 1, 'updated_by' => 1]
                );

                // Step 2: Find or Create User
                $user = User::firstOrCreate(
                    ['email' => strtolower(trim($record['user'])) . '@example.com'],
                    [
                        'username' => trim($record['user']),
                        'password' => Hash::make('123'),
                        'full_name' => trim($record['user']),
                    ]
                );

                // Step 3: Assign Role ("Customer")
                $customerRole = Role::where('name', 'Customer')->first();
                if ($customerRole) {
                    RoleUser::firstOrCreate([
                        'user_id' => $user->id,
                        'role_id' => $customerRole->id,
                    ]);
                }

                // Step 4: Link User to Company
                CompanyUser::firstOrCreate([
                    'company_id' => $company->id,
                    'user_id' => $user->id,
                ]);

                // Step 5: Proceed with Order Processing
                $product = Product::where('id', $record['product_id'])->first();
                if (!$product) {
                    Log::warning("Product not found: " . $record['product_id']);
                    continue;
                }

                $unitPrice = $product->supplier_price;
                $quantity = (int) $record['quantity'];
                $totalPrice = $unitPrice * $quantity;

                // ✅ Create Order & Override Timestamps
                $order = Order::create([
                    'company_id' => $company->id,
                    'company_order_number' => $record['company_order_number'] ?? null,
                    'order_date' => $orderDate,
                    'total_amount' => $totalPrice,
                    'status_id' => 1, // Start with status 2
                    'created_by' => $user->id,
                    'updated_by' => $user->id,
                ]);

                $order->timestamps = false;
                $order->created_at = $orderDate;
                $order->updated_at = $orderDate;
                $order->save();

                $order->update([
                    'megaion_order_number' => 'MEGA-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
                    'updated_at' => $orderDate,
                ]);

                // ✅ Insert Order Items
                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                    'created_by' => $user->id,
                    'updated_by' => $user->id,
                ]);

                $orderItem->timestamps = false;
                $orderItem->created_at = $orderDate;
                $orderItem->updated_at = $orderDate;
                $orderItem->save();

                    // ✅ Status Progression: 2 → 34 → 35 → 11 → 14
                    $statusSequence = [2,34, 35, 11, 14];

                foreach ($statusSequence as $statusId) {
                        $statusName = Status::find($statusId)->name ?? 'Unknown Status';

                        OrderStatus::create([
                            'order_id' => $order->id,
                            'status_id' => $statusId,
                            'status_date' => now(),
                            'comments' => "Status auto-assigned to $statusName",
                            'created_by' => $user->id,
                            'updated_by' => $user->id,
                        ]);

                        $order->update([
                            'status_id' => $statusId,
                            'updated_by' => $user->id,
                        ]);

                    // ✅ Stock Allocations at "Approved"
                    if (strtolower($statusName) === 'approved') {
                        foreach ($order->orderItems as $item) {
                            Log::info("Allocating stock for OrderItem ID: {$item->id}");

                            $availableStocks = $this->getAvailableIncomingStocks($item->product_id, $item->quantity);

                            foreach ($availableStocks as $incomingStock) {
                                OrderTemporaryAllocation::create([
                                    'order_item_id' => $item->id,
                                    'incoming_stock_id' => $incomingStock->id,
                                    'product_id' => $item->product_id,
                                    'created_by' => $user->id,
                                    'updated_by' => $user->id,
                                ]);
                            }
                        }
                    }

                    // ✅ Move Allocated Stock to Outgoing on "Ready to Deliver"
                    if (strtolower($statusName) === 'ready to deliver') {
                        Log::info("Processing 'Ready to Deliver' for Order ID: {$order->id}");

                        foreach ($order->orderItems as $item) {
                            $temporaryAllocations = OrderTemporaryAllocation::where('order_item_id', $item->id)->get();

                            foreach ($temporaryAllocations as $allocation) {
                                try {
                                    OutgoingStock::create([
                                        'order_item_id' => $allocation->order_item_id,
                                        'incoming_stock_id' => $allocation->incoming_stock_id,
                                        'product_id' => $allocation->product_id,
                                        'type' => 'Ordered',
                                        'remarks' => 'Stock has been Ordered',
                                    ]);

                                    Log::info("OutgoingStock saved for OrderItem ID: {$item->id}");
                                } catch (\Exception $e) {
                                    Log::error("Failed to create OutgoingStock: {$e->getMessage()}");
                                }
                            }

                            // Remove temporary allocations after moving stocks
                            OrderTemporaryAllocation::where('order_item_id', $item->id)->delete();
                            Log::info("Temporary allocations removed for OrderItem ID: {$item->id}");
                        }
                    }
                }
            }
        });

        Log::info("CSV Import Completed.");
        $this->info("CSV import completed.");
    }

    public function getAvailableIncomingStocks($productId, $quantityNeeded)
    {
        return IncomingStock::where('product_id', $productId)
            ->where(function ($query) {
                $query->whereNull('expiration_date')
                    ->orWhere('expiration_date', '>=', now()); // Exclude expired stock
            })
            ->whereNotIn('id', function ($query) {
                $query->select('incoming_stock_id')->from('outgoing_stocks'); // Exclude stock used in outgoing
            })
            ->whereNotIn('id', function ($query) {
                $query->select('incoming_stock_id')->from('order_temporary_allocations'); // Exclude allocated stock
            })
            ->orderByRaw('COALESCE(expiration_date, created_at) ASC') // FIFO sorting
            ->limit($quantityNeeded) // Get exact number of stocks needed
            ->get();
    }
}