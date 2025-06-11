<?php

namespace App\Services;

use Carbon\Carbon;
use App\Models\Status;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use Illuminate\Support\Facades\DB;
use App\Models\PurchaseOrderStatus;
use Illuminate\Support\Facades\Auth;

class PurchaseOrderService
{
  public function createPOsForBelowMinimumAndZeroStock()
{
    $userId = Auth::id();
    if (!$userId) throw new \Exception("User not authenticated");

    $today = Carbon::today();

    // Get all products with low or zero stock
    $products = Product::with(['incomingStocks' => fn($q) =>
        $q->whereDoesntHave('outgoingStocks')->select('id', 'product_id', 'quantity', 'expiration_date')
    ])->get(['id', 'name', 'supplier_id', 'supplier_price', 'minimum_quantity']);

    $lowStock = $products->filter(function ($product) use ($today) {
        $validStocks = $product->incomingStocks->filter(fn($s) =>
            is_null($s->expiration_date) || !Carbon::parse($s->expiration_date)->isPast()
        );
        return $validStocks->sum('quantity') < $product->minimum_quantity;
    });

    $grouped = $lowStock->groupBy('supplier_id');

    DB::transaction(function () use ($grouped, $userId) {
        foreach ($grouped as $supplierId => $products) {
            $items = [];

            foreach ($products as $product) {
                // Skip if a PO already exists with matching product & supplier in one of these statuses
                if (PurchaseOrderItem::where('product_id', $product->id)->whereHas('purchaseOrder', function ($q) use ($supplierId) {
                    $q->where('supplier_id', $supplierId)
                      ->whereIn('status_id', [
                          $this->getStatusId('Pending'),
                          $this->getStatusId('Pending Approval'),
                          $this->getStatusId('Approved'),
                          $this->getStatusId('For Receiving'),
                          $this->getStatusId('Partially Received'),
                      ]);
                })->exists()) continue;

                $items[] = [
                    'product_id' => $product->id,
                    'quantity' => $product->minimum_quantity,
                    'unit_price' => $product->supplier_price,
                ];
            }

            if (empty($items)) continue;

            $po = PurchaseOrder::create([
                'supplier_id' => $supplierId,
                'ponumber' => 'Auto-' . strtoupper(uniqid()),
                'order_date' => now(),
                'status_id' => $this->getStatusId('Pending'),
                'total_amount' => 0,
                'created_by' => $userId,
                'updated_by' => $userId,
            ]);

            $totalAmount = 0;
            foreach ($items as $item) {
                $item['purchase_order_id'] = $po->id;
                $item['total_price'] = $item['quantity'] * $item['unit_price'];
                $item['created_by'] = $userId;
                $item['updated_by'] = $userId;
                $totalAmount += $item['total_price'];

                PurchaseOrderItem::create($item);
            }

            $po->update(['total_amount' => $totalAmount]);

            PurchaseOrderStatus::create([
                'purchase_order_id' => $po->id,
                'status_id' => $this->getStatusId('Pending Approval'),
                'status_date' => now(),
                'created_by' => $userId,
                'updated_by' => $userId,
            ]);
        }
    });
}




    private function getStatusId($statusName)
    {
        return Status::where('name', $statusName)->value('id');
    }
}
