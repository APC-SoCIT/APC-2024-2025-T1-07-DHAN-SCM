<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use App\Models\Tag;
use League\Csv\Reader;
use App\Models\Product;
use App\Models\Location;
use App\Models\Supplier;
use App\Models\ProductTag;
use App\Models\ProductUnit;
use App\Models\IncomingStock;
use App\Models\PurchaseOrder;
use Illuminate\Console\Command;
use App\Models\PurchaseOrderItem;
use Illuminate\Support\Facades\DB;
use App\Models\PurchaseOrderStatus;
use App\Models\PurchaseOrderItemDelivery;
use Illuminate\Support\Facades\Log;

class ImportCSVCommand extends Command
{
    protected $signature = 'import:csv {file}';
    protected $description = 'Import products from a CSV file and generate purchase orders';

    public function handle(): void
    {
        $filePath = $this->argument('file');

        if (!file_exists($filePath)) {
            $this->error("File not found: $filePath");
            return;
        }

        // Define status mappings
        $statusMap = [
            'Pending' => 1,
            'Approved' => 2,
            'Received' => 8,
            'Delivered' => 11,
        ];

        // Read CSV file
        try {
            $csv = Reader::createFromPath($filePath, 'r');
            $csv->setHeaderOffset(0);
        } catch (\Exception $e) {
            $this->error("Error reading CSV file: " . $e->getMessage());
            return;
        }

        $productsBySupplier = [];

        foreach ($csv as $record) {
            // Validate required fields
            if (empty($record['product_name']) || empty($record['model']) || empty($record['suppliers'])) {
                Log::warning("Skipping row with missing data: " . json_encode($record));
                continue;
            }

            // Clean up spaces in product name and model
            $name = $this->sanitizeString($record['product_name']);
            $model = $this->sanitizeString($record['model']);

            // Get supplier ID
            $supplierId = $this->getSupplierId($record['suppliers']);
            if (!$supplierId) {
                $this->error("Supplier not found for: " . $record['suppliers']);
                continue;
            }

            // Find or create product
            $existingProduct = Product::firstOrCreate([
                'name' => $name,
                'model' => $model,
            ], [
                'minimum_quantity' => $record['minimum_qty'],
                'profit_margin' => $record['profit_margin % (optional)'] ?? 0,
                'supplier_price' => $record['supplier_price'],
                'is_machine' => strtolower(trim($record['is_machine (Y/N)'])) === 'y',
                'product_unit_id' => $this->getProductUnitId($record['product_unit']),
                'supplier_id' => $supplierId,
                'location_id' => $this->getLocationId($record['location']),
                'warehouse_id' => 1,
                'status_id' => 1,
                'created_by' => 1,
                'updated_by' => 1,
            ]);

            // Assign Tags
            $this->assignTags($existingProduct->id, $record['tags']);

            // Store purchase order data
            $productsBySupplier[$supplierId][] = [
                'product_id' => $existingProduct->id,
                'quantity' => (int) $record['quantity'],
                'unit_price' => (float) $record['supplier_price'],
                'total_price' => (int) $record['quantity'] * (float) $record['supplier_price'],
                'serial_number' => $record['serial_number'] ?? null,
                'lot_number' => $record['lot_number'] ?? null,
                'expiration_date' => $this->parseExpirationDate($record['date_expired']),
            ];
        }

        DB::transaction(function () use ($productsBySupplier, $statusMap) {
            $this->createPurchaseOrders($productsBySupplier, $statusMap);
        });

        $this->info('CSV Import and Purchase Orders created successfully!');
    }

    private function sanitizeString(string $input): string
    {
        return preg_replace('/\s+/', ' ', trim($input));
    }

    private function getProductUnitId(string $unitName): int
    {
        return ProductUnit::firstOrCreate(['name' => $unitName], [
            'abbreviation' =>  $unitName,
            'description' =>  $unitName
        ])->id;
    }

    private function getSupplierId(string $supplierName): int
    {
        return Supplier::firstOrCreate(
            ['name' => $supplierName],
            ['contact_info' => '', 'created_by' => 1, 'updated_by' => 1]
        )->id;
    }

    private function getLocationId(string $locationName): int
    {
        return Location::firstOrCreate(
            ['name' => $locationName], 
            ['created_by' => 1, 'updated_by' => 1] // Ensure `updated_by` is included
        )->id;
    }

    private function assignTags(int $productId, string $tags): void
    {
        foreach (explode(',', $tags) as $tagName) {
            $tag = Tag::firstOrCreate(['name' => trim($tagName)]);

            // Check if the product-tag association already exists
            $existingProductTag = ProductTag::where('product_id', $productId)
                ->where('tag_id', $tag->id)
                ->exists();

            if (!$existingProductTag) {
                ProductTag::create(['product_id' => $productId, 'tag_id' => $tag->id]);
            }
        }
    }

    private function createPurchaseOrders(array $productsBySupplier, array $statusMap): void
    {
        foreach ($productsBySupplier as $supplierId => $products) {
            $purchaseOrder = PurchaseOrder::create([
                'ponumber' => null,
                'supplier_id' => $supplierId,
                'order_date' => now(),
                'total_amount' => 0,
                'status_id' => $statusMap['Pending'],
                'created_by' => 1,
                'updated_by' => 1,
            ]);
    
            $purchaseOrder->ponumber = 'I-' . 'P' . str_pad($purchaseOrder->id, 6, '0', STR_PAD_LEFT);
            $purchaseOrder->save();
    
            PurchaseOrderStatus::create([
                'purchase_order_id' => $purchaseOrder->id,
                'status_id' => $statusMap['Pending'],
                'status_date' => now(),
                'comments' => 'Purchase order created.',
                'created_by' => 1,
                'updated_by' => 1,
            ]);
    
            foreach ($products as $productData) {
                $poItem = PurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'product_id' => $productData['product_id'],
                    'quantity' => $productData['quantity'],
                    'unit_price' => $productData['unit_price'],
                    'total_price' => $productData['total_price'],
                    'created_by' => 1,
                    'updated_by' => 1,
                ]);
    
                $poItemDelivery = PurchaseOrderItemDelivery::create([
                    'purchase_order_item_id' => $poItem->id,
                    'delivered_quantity' => $productData['quantity'],
                    'delivery_date' => now(),
                    'created_by' => 1,
                    'updated_by' => 1,
                ]);
    
                $currentYear = now()->format('Y');
                for ($i = 0; $i < $productData['quantity']; $i++) {
                    $barcode = "{$currentYear}" . str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
                
                    IncomingStock::create([
                        'purchase_order_item_id' => $poItem->id,
                        'purchase_order_item_delivery_id' => $poItemDelivery->id, // ✅ Newly added field
                        'serial_number' => (strtolower($productData['serial_number']) === 'na' || empty($productData['serial_number'])) ? null : $productData['serial_number'],
                        'lot_number' => (strtolower($productData['lot_number']) === 'na' || empty($productData['lot_number'])) ? null : $productData['lot_number'],
                        'expiration_date' => ($productData['expiration_date'] === '1990-01-01' || empty($productData['expiration_date'])) ? null : $productData['expiration_date'],
                        'product_id' => $productData['product_id'],
                        'barcode' => $barcode,
                        'quantity' => 1,
                        'created_by_user_id' => 1,
                        'updated_by_user_id' => 1,
                    ]);
                }
            }
    
            $purchaseOrder->update(['status_id' => $statusMap['Delivered']]);
        }
    }

    private function parseExpirationDate(string $date): ?string
    {
        try {
            return Carbon::createFromFormat('d/m/Y', trim($date))->format('Y-m-d');
        } catch (\Exception $e) {
            return null; // Return null if parsing fails
        }
    }
}