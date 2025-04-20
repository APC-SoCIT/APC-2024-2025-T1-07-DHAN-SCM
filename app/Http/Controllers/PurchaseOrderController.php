<?php

namespace App\Http\Controllers;

use App\Models\Status;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Models\IncomingStock;
use App\Models\PurchaseOrder;
use App\Models\SupplierProduct;
use App\Models\PurchaseOrderItem;
use App\Models\InventoryEquipment;
use Illuminate\Support\Facades\DB;
use App\Models\InventoryConsumable;
use App\Models\PurchaseOrderStatus;
use Illuminate\Support\Facades\Log;
use App\Models\SupplierProductPrice;
use Illuminate\Support\Facades\Auth;

class PurchaseOrderController extends Controller
{

    public function getPurchaseOrderDetails($purchaseOrderId = null)
    {
        if ($purchaseOrderId) {
            $purchaseOrder = PurchaseOrder::with([
                'supplier',
                'status',
                'items.product',
                'items.product.productUnit',
                'items.deliveries' => function ($query) {
                    $query->orderBy('delivery_date', 'desc'); // ✅ Order deliveries by delivery_date in descending order
                },
            ])->findOrFail($purchaseOrderId);

            // Calculate remaining quantity for each item and fetch relevant incoming stocks for deliveries
            $purchaseOrder->items->each(function ($item) {
                $totalDelivered = $item->deliveries->sum('delivered_quantity');
                $item->remaining_quantity = $item->quantity - $totalDelivered;

                // Fetch only incoming stocks **related to each specific delivery**
                $item->deliveries->each(function ($delivery) {
                    $delivery->incoming_stocks = IncomingStock::where('purchase_order_item_delivery_id', $delivery->id)
                        ->get(['id', 'purchase_order_item_delivery_id', 'barcode', 'lot_number', 'serial_number', 'expiration_date']);
                });
            });

            return response()->json(['purchase_order' => $purchaseOrder]);
        } else {
            $purchaseOrders = PurchaseOrder::with([
                'status',
                'supplier',
                'items.product',
                'items.deliveries' => function ($query) {
                    $query->orderBy('delivery_date', 'desc'); // ✅ Order deliveries by delivery_date in descending order
                },
            ])
            ->orderBy('created_at', 'desc') // ✅ Ordered purchase orders by creation date in descending order
            ->get();

            // Calculate remaining quantity for each item and fetch relevant incoming stocks for deliveries
            $purchaseOrders->each(function ($purchaseOrder) {
                $purchaseOrder->items->each(function ($item) {
                    $totalDelivered = $item->deliveries->sum('delivered_quantity');
                    $item->remaining_quantity = $item->quantity - $totalDelivered;

                    // Attach only incoming stocks **for each specific delivery**
                    $item->deliveries->each(function ($delivery) {
                        $delivery->incoming_stocks = IncomingStock::where('purchase_order_item_delivery_id', $delivery->id)
                            ->get(['id', 'purchase_order_item_delivery_id', 'barcode', 'lot_number', 'serial_number', 'expiration_date']);
                    });
                });
            });

            return response()->json(['purchase_orders' => $purchaseOrders]);
        }
    }
    
    public function index()
    {
        return PurchaseOrder::with(['supplier', 'status', 'creator', 'updater'])->get();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'order_date' => 'required|date',
            'total_amount' => 'required|numeric',
            'status_id' => 'required|exists:statuses,id',
        ]);
    
        // Set created_by and updated_by from authenticated user
        $validatedData['created_by'] = auth()->id();
        $validatedData['updated_by'] = auth()->id();
    
        return PurchaseOrder::create($validatedData);
    }
    public function show($id)
    {
        return PurchaseOrder::with(['supplier', 'status', 'creator', 'updater'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);
    
        $validatedData = $request->validate([
            'supplier_id' => 'sometimes|required|exists:suppliers,id',
            'order_date' => 'sometimes|required|date',
            'total_amount' => 'sometimes|required|numeric',
            'status_id' => 'sometimes|required|exists:statuses,id',
        ]);
    
        // Set updated_by from authenticated user
        $validatedData['updated_by'] = auth()->id();
    
        $purchaseOrder->update($validatedData);
    
        return $purchaseOrder;
    }


    public function destroy($id)
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);
        $purchaseOrder->delete();

        return response()->noContent();
    }



    //Start of free functions

    public function createPurchaseOrder(Request $request)
    {
        $userId = Auth::id(); // Get the ID of the authenticated user
    
        // Check if the authenticated user ID is null
        if (is_null($userId)) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }
    
        DB::transaction(function () use ($request, $userId) {
            $totalAmount = 0;
    
            $purchaseOrder = PurchaseOrder::create([
                'supplier_id' => $request->supplier_id,
                'ponumber' => "Normal",
                'order_date' => now(),
                'status_id' => $this->getStatusId('Pending'),
                'total_amount' => 0, // Set initial total_amount to 0
                'created_by' => $userId,
                'updated_by' => $userId,
            ]);
    
            foreach ($request->items as $item) {
                $unitPrice = $item['unit_price'];
                $totalPrice = $item['quantity'] * $unitPrice;
                $totalAmount += $totalPrice;

                PurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                    'created_by' => $userId,
                    'updated_by' => $userId,
                ]);                
            }
    
            $purchaseOrder->total_amount = $totalAmount;
            $purchaseOrder->save();
    
            PurchaseOrderStatus::create([
                'purchase_order_id' => $purchaseOrder->id,
                'status_id' => $this->getStatusId('Pending Approval'),
                'status_date' => now(),
                'created_by' => $userId,
                'updated_by' => $userId,
            ]);
        });
    
        return response()->json(['message' => 'Purchase order created successfully'], 201);
    }

    public function updatePurchaseOrderStatus(Request $request, $id)
    {
        $userId = Auth::id(); // Get the ID of the authenticated user

        DB::transaction(function () use ($request, $id, $userId) {
            $purchaseOrder = PurchaseOrder::find($id);
            // $statusId = $this->getStatusId($request->status);
            $statusId = $request->status_id;

            $purchaseOrder->status_id = $statusId;
            $purchaseOrder->updated_by = $userId;
            $purchaseOrder->save();

            PurchaseOrderStatus::create([
                'purchase_order_id' => $purchaseOrder->id,
                'status_id' => $statusId,
                'status_date' => now(),
                'created_by' => $userId,
                'updated_by' => $userId,
            ]);

        
        });

        return response()->json(['message' => 'Purchase order status updated successfully']);
    }
    private function getStatusId($statusName)
    {
        return Status::where('name', $statusName)->first()->id;
    }


}
