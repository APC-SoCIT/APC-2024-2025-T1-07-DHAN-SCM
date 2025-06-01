<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use League\Csv\Reader;
use App\Models\Order;
use App\Models\User;
use App\Models\Company;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\OrderItem;
use App\Models\CompanyUser;
use App\Models\Role;
use App\Models\RoleUser;
use App\Models\Status;
use App\Models\OrderStatus;
use App\Models\OrderTemporaryAllocation;
use App\Models\OutgoingStock;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

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
                Log::info("Processing record: " . json_encode($record));

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

                $company = Company::firstOrCreate(
                    ['name' => trim($record['customer'])],
                    ['created_by' => 1, 'updated_by' => 1]
                );

                $user = User::firstOrCreate(
                    ['email' => strtolower(trim($record['user'])) . '@example.com'],
                    [
                        'username' => trim($record['user']),
                        'password' => Hash::make('123'),
                        'full_name' => trim($record['user']),
                    ]
                );

                $customerRole = Role::where('name', 'Customer')->first();
                if ($customerRole) {
                    RoleUser::firstOrCreate([
                        'user_id' => $user->id,
                        'role_id' => $customerRole->id,
                    ]);
                }

                CompanyUser::firstOrCreate([
                    'company_id' => $company->id,
                    'user_id' => $user->id,
                ]);

                $product = Product::where('id', $record['product_id'])->first();
                if (!$product) {
                    Log::warning("Product not found: " . $record['product_id']);
                    continue;
                }

                $unitPrice = $product->supplier_price;
                $quantity = (int) $record['quantity'];
                $totalPrice = $unitPrice * $quantity;

                $order = Order::create([
                    'company_id' => $company->id,
                    'company_order_number' => $record['company_order_number'] ?? null,
                    'order_date' => $orderDate,
                    'total_amount' => $totalPrice,
                    'status_id' => 1,
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
            }
        });

        Log::info("CSV Import Completed.");
        $this->info("CSV import completed.");
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $request->validate([
            'status_id' => 'required|exists:statuses,id',
        ]);

        DB::beginTransaction();

        try {
            $statusName = Status::find($request->status_id)->name ?? 'Unknown Status';

            $order->update([
                'status_id' => $request->status_id,
                'updated_by' => auth()->id(),
            ]);

            OrderStatus::create([
                'order_id' => $order->id,
                'status_id' => $request->status_id,
                'status_date' => now(),
                'comments' => "Status updated to $statusName",
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);

            if (strtolower($statusName) === 'approved') {
                foreach ($order->orderItems as $item) {
                    $availableStocks = $this->getAvailableIncomingStocks($item->product_id, $item->quantity);
                    foreach ($availableStocks as $incomingStock) {
                        OrderTemporaryAllocation::create([
                            'order_item_id' => $item->id,
                            'incoming_stock_id' => $incomingStock->id,
                            'product_id' => $item->product_id,
                            'created_by' => auth()->id(),
                            'updated_by' => auth()->id(),
                        ]);
                    }
                }
            }

            if (strtolower($statusName) === 'ready to deliver') {
                foreach ($order->orderItems as $item) {
                    $temporaryAllocations = OrderTemporaryAllocation::where('order_item_id', $item->id)->get();
                    foreach ($temporaryAllocations as $allocation) {
                        OutgoingStock::create([
                            'order_item_id' => $allocation->order_item_id,
                            'incoming_stock_id' => $allocation->incoming_stock_id,
                            'product_id' => $allocation->product_id,
                            'type' => 'Ordered',
                            'remarks' => 'Stock has been Ordered',
                        ]);
                    }
                    OrderTemporaryAllocation::where('order_item_id', $item->id)->delete();
                }
            }

            DB::commit();
            return response()->json($order->load(['orderItems.product', 'orderStatuses.status']), 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}