<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Status;
use App\Models\OrderItem;
use App\Models\OrderStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index()
    {
        return Order::with(['company', 'status', 'creator', 'updater', 'orderItems.product'])->get();
    }

    public function show($id)
    {
        return Order::with(['company', 'status', 'creator', 'updater', 'orderItems.product'])->findOrFail($id);
    }


    public function store(Request $request)
    {
        $request->validate([
            'company_id' => 'required|exists:companies,id',
            'company_order_number' => 'nullable|string|unique:orders,company_order_number',
            'order_date' => 'required|date',
            'total_amount' => 'nullable|numeric',
            'status_id' => 'required|exists:statuses,id',
            'order_items' => 'required|array',
            'order_items.*.product_id' => 'required|exists:products,id',
            'order_items.*.quantity' => 'required|numeric',
            'order_items.*.unit_price' => 'required|numeric',
            'order_items.*.total_price' => 'required|numeric',
        ]);
    
        DB::beginTransaction();
    
        try {
            // Create the Order
            $order = Order::create(array_merge($request->except('order_items'), [
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]));
    
            // Generate the MEGA order number based on the inserted ID
            $order->update([
                'megaion_order_number' => 'MEGA' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
            ]);
    
            // Insert order items
            foreach ($request->order_items as $item) {
                OrderItem::create(array_merge($item, [
                    'order_id' => $order->id,
                    'created_by' => auth()->id(),
                    'updated_by' => auth()->id(),
                ]));
            }
    
            // Get status description
            $statusDescription = Status::find($order->status_id)->description ?? 'Status not found';
    
            // Save initial order status in order_statuses table with status description
            OrderStatus::create([
                'order_id' => $order->id,
                'status_id' => $order->status_id,
                'status_date' => now(),
                'comments' => 'Initial order status: ' . $statusDescription,
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);
    
            DB::commit();
    
            // Load related data: order items and order statuses
            return response()->json($order->load(['orderItems.product', 'orderStatuses.status']), 201);
        } catch (Exception $e) {
            DB::rollBack();
    
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }   

    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);
    
        $request->validate([
            'status_id' => 'required|exists:statuses,id',
        ]);
    
        DB::beginTransaction();
    
        try {
            // Get status name
            $statusName = Status::find($request->status_id)->name ?? 'Unknown Status';
    
            // Update only the status field
            $order->update([
                'status_id' => $request->status_id,
                'updated_by' => auth()->id(),
            ]);
    
            // Log the status change in order_statuses table with status name in comments
            OrderStatus::create([
                'order_id' => $order->id,
                'status_id' => $request->status_id,
                'status_date' => now(),
                'comments' => "Status updated to $statusName",
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);
    
            // If status is "Approved", allocate stock using FIFO (excluding expired & used items)
            if (strtolower($statusName) === 'approved') {
                foreach ($order->orderItems as $item) {
                    $quantityNeeded = $item->quantity;
    
                    // Retrieve available stock in FIFO order (one row = one quantity)
                    $incomingStocks = IncomingStock::where('product_id', $item->product_id)
                        ->where(function ($query) {
                            $query->whereNull('expiration_date')
                                  ->orWhere('expiration_date', '>=', now()); // Exclude expired stock
                        })
                        ->whereNotIn('id', function ($query) {
                            $query->select('incoming_stock_id')->from('outgoing'); // Exclude stock used in outgoing
                        })
                        ->whereNotIn('id', function ($query) {
                            $query->select('incoming_stock_id')->from('demo'); // Exclude stock used in demo
                        })
                        ->orderByRaw('COALESCE(expiration_date, created_at) ASC') // FIFO sorting
                        ->limit($quantityNeeded) // Get exact number of stocks needed
                        ->get();
    
                    foreach ($incomingStocks as $incomingStock) {
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
    
            DB::commit();
    
            // Return order with order items and statuses
            return response()->json($order->load(['orderItems.product', 'orderStatuses.status']), 200);
        } catch (Exception $e) {
            DB::rollBack();
    
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
   

    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return response()->noContent();
    }
}