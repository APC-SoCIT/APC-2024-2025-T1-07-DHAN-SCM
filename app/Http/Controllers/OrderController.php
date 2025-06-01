<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Status;
use App\Models\OrderItem;
use App\Models\CompanyUser;
use App\Models\OrderStatus;
use Illuminate\Http\Request;
use App\Models\IncomingStock;
use App\Models\OutgoingStock;
use Illuminate\Support\Facades\DB;
use App\Models\OrderTemporaryAllocation;

class OrderController extends Controller
{
    public function index()
    {
        // Get the authenticated user
        $user = auth()->user();
    
        // Fetch user's role using the relationship
        $role = $user->roleUsers()->with('role')->first()?->role->name ?? null;
        // Start the query
        $query = Order::with([
            'company',
            'status',
            'creator',
            'updater',
            'orderItems.product',
            'orderItems.orderTemporaryAllocations.incomingStock', // Include temporary stock allocations
            'orderItems.outgoingStocks.incomingStock', // Include outgoing stock details
            'orderStatuses.status' // Include order statuses with status details
        ]);
    
        // If the user's role is "Customer," filter by their created orders
        if ($role === 'Customer') {
            $query->where('created_by', $user->id);
        }
    
        return response()->json($query->orderBy('megaion_order_number', 'desc')->get());
    }

    public function show($id)
    {
        return Order::with([
            'company',
            'status',
            'creator',
            'updater',
            'orderItems.product',
            'orderItems.orderTemporaryAllocations.incomingStock', // Include temporary stock allocations
            'orderItems.outgoingStocks.incomingStock', // Include outgoing stock details
            'orderStatuses.status' // Include order statuses with status details
        ])->findOrFail($id);
    }


    public function store(Request $request)
    {
        
        $request->validate([
            'company_order_number' => 'nullable|string',
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
            // Get company_id from logged-in user
            $companyUser = CompanyUser::where('user_id', auth()->id())->first();
    
            if (!$companyUser) {
                return response()->json(['error' => 'Company not found for the logged-in user'], 400);
            }
    
            // Create the Order
            $order = Order::create([
                'company_id' => $companyUser->company_id,
                'company_order_number' => $request->company_order_number,
                'order_date' => $request->order_date,
                'total_amount' => $request->total_amount,
                'status_id' => $request->status_id,
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);
    
            // Generate MEGA order number based on inserted ID
            $order->update([
                'megaion_order_number' => 'MEGA-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
            ]);
    
            // Insert order items
            foreach ($request->order_items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['total_price'],
                    'created_by' => auth()->id(),
                    'updated_by' => auth()->id(),
                ]);
            }
    
            // Get status description
            $status = Status::find($order->status_id);
            $statusDescription = $status ? $status->description : 'Status not found';
    
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
    
            // If status is "Ready to Deliver", move stock from temporary allocation to outgoing_stocks
            if (strtolower($statusName) === 'ready to deliver') {
                foreach ($order->orderItems as $item) {
                    $temporaryAllocations = OrderTemporaryAllocation::where('order_item_id', $item->id)->get();
                    foreach ($temporaryAllocations as $allocation) {

                        OutgoingStock::create([
                            'order_item_id' => $allocation->order_item_id,
                            'incoming_stock_id' => $allocation->incoming_stock_id,
                            'product_id' => $allocation->product_id, // ✅ Ensure product_id is included
                            'type' => 'Ordered',
                            'remarks' => 'Stock has been Ordered',
                        ]);
                    }
    
                    // Remove allocated stock from temporary allocations once moved
                    OrderTemporaryAllocation::where('order_item_id', $item->id)->delete();
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
    

    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return response()->noContent();
    }
}