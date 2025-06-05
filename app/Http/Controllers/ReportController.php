<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Product;
use App\Models\DemoUnit;
use Illuminate\Http\Request;
use App\Models\IncomingStock;
use App\Models\OutgoingStock;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;

class ReportController extends Controller
{
    //

    public function availables()
    {
        $products = Product::with('incomingStocks.outgoingStocks')->get()->map(function ($product) {
            $availableQuantity = $product->incomingStocks->sum('quantity') - $product->incomingStocks->flatMap->outgoingStocks->count();
            
            return [
                'product_id' => $product->id,
                'available_quantity' => $availableQuantity,
                'minimum_quantity' => $product->minimum_quantity,
                'outgoing_count' => $product->incomingStocks->flatMap->outgoingStocks->count(), // Total outgoing stocks
                'is_out_of_stock' => $availableQuantity <= 0, // True if stock is depleted
            ];
        });
    
        return response()->json($products);
    }



    public function outOfStocks2(Request $request)
    {
        $query = Product::with([
            'incomingStocks'
        ]);

        $products = $query->get()
            ->map(function ($product) {
                $availableQuantity = $product->incomingStocks
                    ->reject(fn($stock) => OutgoingStock::where('incoming_stock_id', $stock->id)->exists())
                    ->filter(fn($stock) => is_null($stock->expiration_date) || !Carbon::parse($stock->expiration_date)->isPast())
                    ->sum('quantity');

                return ['available_quantity' => $availableQuantity];
            })
            ->filter(fn($product) => $product['available_quantity'] == 0)
            ->count(); // Count the products where available_quantity is 0

        return response()->json(['out_of_stock_count' => $products]);
    }

    public function outOfStocks(Request $request)
    {
        // Preload all outgoing incoming_stock_ids to prevent N+1 queries
        $outgoingStockIds = OutgoingStock::pluck('incoming_stock_id')->toArray();

        $products = Product::with('incomingStocks')->get();

        $outOfStockCount = $products->map(function ($product) use ($outgoingStockIds) {
            $availableQuantity = $product->incomingStocks
                ->reject(fn($stock) => in_array($stock->id, $outgoingStockIds))
                ->filter(fn($stock) => is_null($stock->expiration_date) || !Carbon::parse($stock->expiration_date)->isPast())
                ->sum('quantity');

            return ['available_quantity' => $availableQuantity];
        })
        ->filter(fn($product) => $product['available_quantity'] == 0)
        ->count();

        return response()->json(['out_of_stock_count' => $outOfStockCount]);
    }


   public function belowMinimumStocks2(Request $request)
    {
        // Get the 'showDetails' parameter from the request (defaults to false)
        $showDetails = filter_var($request->query('showDetails', false), FILTER_VALIDATE_BOOLEAN);

        $belowMinimumProducts = Product::with(['incomingStocks.outgoingStocks'])->get()
            ->map(function ($product) {
                $validStocks = $product->incomingStocks
                    ->reject(fn($stock) => OutgoingStock::where('incoming_stock_id', $stock->id)->exists()) // Exclude stocks already in OutgoingStock
                    ->filter(fn($stock) => is_null($stock->expiration_date) || !Carbon::parse($stock->expiration_date)->isPast()); // Ignore expired stocks

                $availableQuantity = $validStocks->sum('quantity');

                return array_merge($product->toArray(), [
                    'available_quantity' => $availableQuantity,
                    'below_minimum' => $availableQuantity > 0 && $availableQuantity < $product->minimum_quantity
                ]);
            })
            ->filter(fn($product) => $product['below_minimum']) // Filter only below-minimum stocks
            ->count(); // Get count

        return response()->json(['below_minimum_count' => $belowMinimumProducts]);
    }

    public function belowMinimumStocks(Request $request)
    {
        // Optional query param (currently unused but kept for future logic)
        $showDetails = filter_var($request->query('showDetails', false), FILTER_VALIDATE_BOOLEAN);

        // Preload all outgoing incoming_stock_ids to avoid N+1 queries
        $outgoingStockIds = OutgoingStock::pluck('incoming_stock_id')->toArray();

        // Only fetch products that have at least one incoming stock
        $products = Product::with('incomingStocks')->get();

        // Map, filter and count in one pipeline
        $belowMinimumCount = $products->map(function ($product) use ($outgoingStockIds) {
            $availableQuantity = $product->incomingStocks
                ->reject(fn($stock) => in_array($stock->id, $outgoingStockIds))
                ->filter(fn($stock) => is_null($stock->expiration_date) || !Carbon::parse($stock->expiration_date)->isPast())
                ->sum('quantity');

            return [
                'available_quantity' => $availableQuantity,
                'minimum_quantity' => $product->minimum_quantity,
            ];
        })->filter(fn($data) => $data['available_quantity'] > 0 && $data['available_quantity'] < $data['minimum_quantity'])
        ->count();

        return response()->json(['below_minimum_count' => $belowMinimumCount]);
    }


  

    public function getAllDemoUnits(Request $request)
    {
        // Get the 'showDetails' parameter from the request (defaults to false)
        $showDetails = filter_var($request->query('showDetails', false), FILTER_VALIDATE_BOOLEAN);

        // Fetch all demo units
        $demoUnits = DemoUnit::with('incomingStock')->get();

        // If 'showDetails' is true, return full details, otherwise return only the count
        if ($showDetails) {
            $demoUnits = $demoUnits->map(function ($demoUnit) {
                return [
                    'demo_unit_id' => $demoUnit->id,
                    'incoming_stock_id' => $demoUnit->incoming_stock_id,
                    'company_id' => $demoUnit->company_id,
                    'assigned_person_id' => $demoUnit->assigned_person_id,
                    'status_id' => $demoUnit->status_id,
                    'demo_start' => $demoUnit->demo_start,
                    'demo_end' => $demoUnit->demo_end,
                    'notes' => $demoUnit->notes,
                ];
            });

            return response()->json(['demo_units' => $demoUnits]);
        }

        return response()->json(['demo_unit_count' => $demoUnits->count()]);
    }

    public function demoUnitOverDueNearExpire(Request $request)
    {
        // Get the 'showDetails' parameter (default to false)
        $showDetails = filter_var($request->query('showDetails', false), FILTER_VALIDATE_BOOLEAN);
    
        // Get the current date and calculate the date one week from now
        $oneWeekFromNow = now()->addWeek();
    
        // Fetch demo units where demo_end is either within the next week OR has already passed
        $demoUnits = DemoUnit::where('demo_end', '<=', $oneWeekFromNow)
            ->with('incomingStock')
            ->get();
    
        // If 'showDetails' is true, return full details, otherwise return only the count
        if ($showDetails) {
            $demoUnits = $demoUnits->map(function ($demoUnit) {
                return [
                    'demo_unit_id' => $demoUnit->id,
                    'incoming_stock_id' => $demoUnit->incoming_stock_id,
                    'company_id' => $demoUnit->company_id,
                    'assigned_person_id' => $demoUnit->assigned_person_id,
                    'status_id' => $demoUnit->status_id,
                    'demo_start' => $demoUnit->demo_start,
                    'demo_end' => $demoUnit->demo_end,
                    'notes' => $demoUnit->notes,
                ];
            });
    
            return response()->json(['demo_units' => $demoUnits]);
        }
    
        return response()->json(['demo_unit_count' => $demoUnits->count()]);
    }


    public function getTopSellingProducts()
    {
        $products = DB::select("
            SELECT 
                a.id AS product_id, 
                a.name,
                a.model,
                SUM(b.quantity) AS total_quantity_sold,
                COALESCE(
                    (SELECT SUM(s.quantity) 
                    FROM incoming_stocks s
                    WHERE NOT EXISTS (
                        SELECT 1 FROM outgoing_stocks o WHERE o.incoming_stock_id = s.id
                    ) 
                    AND (s.expiration_date IS NULL OR s.expiration_date > CURRENT_DATE)
                    AND s.product_id = a.id
                    ), 
                    0
                ) AS available_quantity,
                (a.supplier_price + a.profit_margin) AS selling_price
            FROM products a
            INNER JOIN order_items b ON a.id = b.product_id
            GROUP BY a.id, a.name, a.model, a.supplier_price, a.profit_margin
            ORDER BY total_quantity_sold DESC
        ");

        return response()->json(['products' => $products]);
    }

    public function getRecentTransactions()
    {
        $transactions = DB::select("
            SELECT 
                a.created_at AS created_at,
                COALESCE(b.name, 'Unknown Customer') AS customer,
                a.total_amount AS total_amount,
                a.megaion_order_number AS megaion_order_number,
                COALESCE((SELECT name FROM statuses WHERE id = a.status_id), 'Unknown Status') AS status
            FROM orders a
            LEFT JOIN companies b ON a.company_id = b.id
            ORDER BY a.created_at DESC
        ");
    
        return response()->json(['transactions' => $transactions]);
    }

    public function getThisMonthRevenue()
    {
        $totalRevenue = DB::table('orders')
            ->where('status_id', 14) // Ensure this is the correct status ID for "delivered"
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total_amount');

        return response()->json(['total_revenue' => $totalRevenue]);
    }

    public function getTotalCustomer()
    {
        $totalCustomers = DB::select("SELECT COUNT(*) AS total_customers FROM companies");

        return response()->json(['total_customers' => $totalCustomers[0]->total_customers]);
    }

        public function getMonthlyRevenue()
    {
        $monthlyRevenue = [];

        for ($month = 1; $month <= 12; $month++) {
            $totalRevenue = DB::table('orders')
                ->where('status_id', 14) // Ensure this is the correct status ID for "delivered"
                ->whereMonth('created_at', $month)
                ->whereYear('created_at', now()->year)
                ->sum('total_amount');

            $monthName = date("F", mktime(0, 0, 0, $month, 1)); // Convert month number to name
            $monthlyRevenue[$monthName] = $totalRevenue;
        }

        return response()->json(['monthly_revenue' => $monthlyRevenue]);
    }
    


public function forServicingCount2()
{
    $count = collect(DB::select("
        SELECT  
            B.name AS product_name,
            ii.serial_number,
            latest_maintenance.next_maintenance_date,
            latest_calibration.calibration_date
        FROM outgoing_stocks A
        INNER JOIN products B ON B.id = A.product_id
        INNER JOIN incoming_stocks ii ON ii.id = A.incoming_stock_id
        LEFT JOIN (
            SELECT incoming_stock_id, next_maintenance_date 
            FROM maintenance_records 
            ORDER BY next_maintenance_date DESC
        ) latest_maintenance ON latest_maintenance.incoming_stock_id = A.incoming_stock_id
        LEFT JOIN (
            SELECT incoming_stock_id, calibration_date 
            FROM calibration_records 
            ORDER BY calibration_date DESC
        ) latest_calibration ON latest_calibration.incoming_stock_id = A.incoming_stock_id
        WHERE B.is_machine = 1
    "))
    ->map(function ($item) {
        $nextMaintenanceDate = $item->next_maintenance_date ? Carbon::parse($item->next_maintenance_date) : null;
        $forMaintenance = !$nextMaintenanceDate || Carbon::today()->diffInDays($nextMaintenanceDate) < 30;

        return ['for_maintenance' => $forMaintenance];
    })
    ->filter(fn($item) => $item['for_maintenance'] === true)
    ->count();

    return response()->json(['maintenance_count' => $count]);
}

public function forServicingCount()
{
    $items = collect(DB::select("
        SELECT  
            B.name AS product_name,
            ii.serial_number,
            latest_maintenance.next_maintenance_date,
            latest_calibration.calibration_date
        FROM outgoing_stocks A
        INNER JOIN products B ON B.id = A.product_id
        INNER JOIN incoming_stocks ii ON ii.id = A.incoming_stock_id
        LEFT JOIN (
            SELECT t1.*
            FROM maintenance_records t1
            INNER JOIN (
                SELECT incoming_stock_id, MAX(maintenance_date) as max_date
                FROM maintenance_records
                WHERE next_maintenance_date IS NOT NULL
                GROUP BY incoming_stock_id
            ) t2 ON t1.incoming_stock_id = t2.incoming_stock_id AND t1.maintenance_date = t2.max_date
        ) latest_maintenance ON latest_maintenance.incoming_stock_id = A.incoming_stock_id
        LEFT JOIN (
            SELECT t1.*
            FROM calibration_records t1
            INNER JOIN (
                SELECT incoming_stock_id, MAX(calibration_date) as max_date
                FROM calibration_records
                WHERE calibration_date IS NOT NULL
                GROUP BY incoming_stock_id
            ) t2 ON t1.incoming_stock_id = t2.incoming_stock_id AND t1.calibration_date = t2.max_date
        ) latest_calibration ON latest_calibration.incoming_stock_id = A.incoming_stock_id
        WHERE B.is_machine = 1
    "))
    ->map(function ($item) {
        $today = Carbon::today();

        // Maintenance check
        $nextMaintenanceDate = $item->next_maintenance_date
            ? Carbon::parse($item->next_maintenance_date)
            : null;

        $forMaintenance = false;
        if ($nextMaintenanceDate) {
            $daysUntilMaintenance = $today->diffInDays($nextMaintenanceDate, false);
            $forMaintenance = $daysUntilMaintenance < 30;
        }

        return [
            'for_maintenance' => $forMaintenance
        ];
    })
    ->filter(fn($item) => $item['for_maintenance'])
    ->count();

    return response()->json(['maintenance_count' => $items]);
}



                    

}
