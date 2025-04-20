<?php

namespace App\Http\Controllers;

use App\Models\Product;
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
        

}
