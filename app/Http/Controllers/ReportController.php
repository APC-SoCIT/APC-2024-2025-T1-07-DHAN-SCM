<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\DemoUnit;
use Illuminate\Http\Request;
use App\Models\IncomingStock;
use Illuminate\Support\Facades\DB;
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



    public function outOfStocks(Request $request)
    {
        // Get the 'showDetails' parameter from the request (defaults to false)
        $showDetails = filter_var($request->query('showDetails', false), FILTER_VALIDATE_BOOLEAN);
    
        // Filter out-of-stock products
        $outOfStockProducts = Product::with('incomingStocks.outgoingStocks')->get()->filter(function ($product) {
            $availableQuantity = $product->incomingStocks->sum('quantity') - $product->incomingStocks->flatMap->outgoingStocks->count();
            return $availableQuantity <= 0;
        });
    
        // If 'showDetails' is true, return full details, otherwise return only the count
        if ($showDetails) {
            $outOfStockProducts = $outOfStockProducts->map(function ($product) {
                return [
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'available_quantity' => 0,
                    'minimum_quantity' => $product->minimum_quantity,
                    'outgoing_count' => $product->incomingStocks->flatMap->outgoingStocks->count(),
                    'is_out_of_stock' => true,
                ];
            });
    
            return response()->json(['out_of_stock_products' => $outOfStockProducts]);
        }
    
        return response()->json(['out_of_stock_count' => $outOfStockProducts->count()]);
    }

    public function belowMinimumStocks(Request $request)
    {
        // Get the 'showDetails' parameter from the request (defaults to false)
        $showDetails = filter_var($request->query('showDetails', false), FILTER_VALIDATE_BOOLEAN);
    
        // Filter products that have stock but are below minimum
        $belowMinimumProducts = Product::with('incomingStocks.outgoingStocks')->get()->filter(function ($product) {
            $availableQuantity = $product->incomingStocks->sum('quantity') - $product->incomingStocks->flatMap->outgoingStocks->count();
            return $availableQuantity > 0 && $availableQuantity < $product->minimum_quantity; // Filter below minimum
        });
    
        // If 'showDetails' is true, return full details, otherwise return only the count
        if ($showDetails) {
            $belowMinimumProducts = $belowMinimumProducts->map(function ($product) {
                return [
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'available_quantity' => $product->incomingStocks->sum('quantity') - $product->incomingStocks->flatMap->outgoingStocks->count(),
                    'minimum_quantity' => $product->minimum_quantity,
                    'outgoing_count' => $product->incomingStocks->flatMap->outgoingStocks->count(),
                    'is_below_minimum' => true, // Flagging below minimum stock items
                ];
            });
    
            return response()->json(['below_minimum_products' => $belowMinimumProducts]);
        }
    
        return response()->json(['below_minimum_count' => $belowMinimumProducts->count()]);
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
                

}
