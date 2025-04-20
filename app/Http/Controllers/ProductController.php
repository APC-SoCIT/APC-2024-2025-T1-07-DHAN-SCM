<?php

namespace App\Http\Controllers;

use Log;
use Storage;
use Carbon\Carbon;
use App\Models\Product;
use App\Models\DemoUnit;
use App\Models\ProductType;
use Illuminate\Http\Request;
use App\Models\PurchaseOrder;
use App\Models\SupplierProduct;
use App\Models\PurchaseOrderItem;
use Illuminate\Http\UploadedFile;

class ProductController extends Controller
{


    public function getAllProducts($productId = null)  
    {  
        $query = Product::with([  
            'productUnit',  
            'supplier',  
            'location',  
            'warehouse',  
            'status',  
            'creator',  
            'updater',  
            'tags',  
            'incomingStocks.calibrationRecords',  
            'incomingStocks.maintenanceRecords'  
        ]);
    
        // If productId is provided, filter the query
        if ($productId !== null) {
            $query->where('id', $productId);
        }
    
        $products = $query->get()
            ->map(function ($product) {  
                $availableQuantity = $product->incomingStocks
                ->reject(fn($stock) => DemoUnit::where('incoming_stock_id', $stock->id)->exists()) // Exclude stocks in DemoUnit
                ->filter(fn($stock) => is_null($stock->expiration_date) || !Carbon::parse($stock->expiration_date)->isPast()) 
                ->sum('quantity'); 

                    $filteredIncomingStocks = $product->incomingStocks->reject(fn($stock) => 
                    DemoUnit::where('incoming_stock_id', $stock->id)->exists()
                );
                
                $groupedStocks = $filteredIncomingStocks->isNotEmpty()
                    ?  $filteredIncomingStocks
                        ->groupBy(fn($stock) => implode('|', [  
                            $stock->purchase_order_item_id,  
                            $stock->serial_number ?? 'NULL',  
                            $stock->lot_number ?? 'NULL',  
                            $stock->expiration_date ?? 'NULL',  
                            $stock->product_id  
                        ]))  
                        ->map(function ($stocks) use ($product) {  
                            $firstStock = $stocks->first();  
                            $remainingTimeString = null;  
                            $status = 'In Stock';  
                            $quantity = $stocks->sum('quantity');  
    
                            if (!$product->is_machine) {  
                                if (is_null($firstStock->lot_number) || is_null($firstStock->expiration_date)) {  
                                    $status = 'INSTOCK';  
                                } else {  
                                    $expirationDate = Carbon::parse($firstStock->expiration_date);  
                                    $today = Carbon::today();  
                                    $remainingTime = $today->diff($expirationDate);  
    
                                    if ($expirationDate->isPast()) {  
                                        $status = 'EXPIRED';  
                                        $remainingTimeString = 'Expired ' . $remainingTime->y . ' Years, ' . $remainingTime->m . ' Months, and ' . $remainingTime->d . ' Days Ago';  
                                    } elseif ($expirationDate->greaterThan($today->addMonths(3))) {  
                                        $status = 'VIABLE';  
                                        $remainingTimeString = 'Expires in ' . $remainingTime->y . ' Years, ' . $remainingTime->m . ' Months, and ' . $remainingTime->d . ' Days';  
                                    } else {  
                                        $status = 'EXPIRING';  
                                        $remainingTimeString = 'Expiring in ' . $remainingTime->m . ' Months and ' . $remainingTime->d . ' Days';  
                                    }  
                                }  
                            }  
    
                            $calibrationRecords = $firstStock->calibrationRecords
                                ->sortByDesc('calibration_date')
                                ->map(fn($record) => [
                                    'calibration_date' => $record->calibration_date,
                                    'calibrated_by' => $record->calibrated_by,
                                    'calibration_notes' => $record->calibration_notes,
                                    'calibration_status_id' => $record->calibration_status_id
                                ])->values()->toArray();
    
                            $maintenanceRecords = $firstStock->maintenanceRecords
                                ->sortByDesc('maintenance_date')
                                ->map(fn($record) => [
                                    'maintenance_date' => $record->maintenance_date,
                                    'next_maintenance_date' => $record->next_maintenance_date,
                                    'performed_by' => $record->performed_by,
                                    'description' => $record->description
                                ])->values()->toArray();
    
                            // Determine if calibration is needed
                            $latestCalibration = $calibrationRecords[0] ?? null;
                            $forCalibration = !$latestCalibration;
    
                            // Determine if maintenance is needed
                            $latestMaintenance = $maintenanceRecords[0] ?? null;
                            $nextMaintenanceDate = $latestMaintenance['next_maintenance_date'] ?? null;
                            $forMaintenance =  (Carbon::today())->diffInDays( Carbon::parse($nextMaintenanceDate)) < 30;
    
                            return [  
                                'purchase_order_item_id' => $firstStock->purchase_order_item_id,  
                                'serial_number' => $firstStock->serial_number,  
                                'lot_number' => $firstStock->lot_number,  
                                'expiration_date' => $firstStock->expiration_date,  
                                'product_id' => $firstStock->product_id,  
                                'quantity' => $quantity,  
                                'status' => $status,  
                                'remaining_time' => $remainingTimeString,  
                                'barcodes' => $stocks->pluck('barcode')->toArray(),  
                                'calibration_records' => $calibrationRecords,  
                                'for_calibration' => (bool) $forCalibration,  
                                'maintenance_records' => $maintenanceRecords,  
                                'for_maintenance' => (bool) $forMaintenance  
                            ];  
                        })
                        ->values()
                    : collect();

               
    
                // ✅ Calculate `total_for_calibration` and `total_for_maintenance` AFTER grouping
                if($product->is_machine){
                    $totalForCalibration = $groupedStocks->filter(fn($stock) => $stock['for_calibration'] === true)->count();
                    $totalForMaintenance = $groupedStocks->filter(fn($stock) => $stock['for_maintenance'] === true)->count();
                      // ✅ Calculate `total_demo_units` by counting related demo units for each product
                    $totalDemoUnits = DemoUnit::whereIn('incoming_stock_id', $product->incomingStocks->pluck('id'))->count();

                }
                else{
                    $totalForCalibration = 0;
                    $totalForMaintenance = 0;
                      // ✅ Calculate `total_demo_units` by counting related demo units for each product
                    $totalDemoUnits =0;

                }
    
                return array_merge($product->toArray(), [  
                    'available_quantity' => $availableQuantity,  
                    'quantity_level' => $availableQuantity == 0  
                        ? 'No Stock'  
                        : ($availableQuantity < $product->minimum_quantity ? 'Below Minimum' : 'Above Minimum'),  
                    'default_selling_price' => number_format($product->supplier_price + ($product->supplier_price * ($product->profit_margin / 100)), 2, '.', ''),  
                    'incoming_stocks' => $groupedStocks->toArray(),
                    'total_for_calibration' => $totalForCalibration, // ✅ Fixed Calculation
                    'total_for_maintenance' => $totalForMaintenance, // ✅ Fixed Calculation
                    'total_demo_units' => $totalDemoUnits
                ]);  
            });
    
        return response()->json($productId !== null ? $products->first() : $products);
    }

    /**
     * Display a listing of the products.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $products = Product::all();
        return response()->json($products);
    }

    /**
     * Store a newly created product in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
{
    // ✅ Remove `image` from validation if explicitly set to null
    if ($request->input('image') === null) {
        $request->request->remove('image'); // Prevent Laravel from treating it as a file
    }

    // ✅ Convert 'is_machine' to a proper boolean before validation
    $request->merge([
        'is_machine' => filter_var($request->is_machine, FILTER_VALIDATE_BOOLEAN),
    ]);

    // ✅ Apply conditional validation: Only validate image if it exists
    $imageRules = $request->hasFile('image') ? 'file|image|mimes:jpeg,png,jpg,gif|max:2048' : 'nullable';

    // ✅ Validate the incoming request
    $validatedData = $request->validate([
        'name' => 'required|string|max:255',
        'model' => 'nullable|string|max:255',
        'description' => 'nullable|string',
        'product_unit_id' => 'required|exists:product_units,id',
        'minimum_quantity' => 'required|integer|min:0',
        'profit_margin' => 'required|numeric|min:0|max:100',
        'image' => $imageRules, // Corrected validation rule for image
        'supplier_id' => 'nullable|exists:suppliers,id',
        'supplier_price' => 'required|numeric|min:0',
        'location_id' => 'nullable',
        'warehouse_id' => 'nullable',
        'is_machine' => 'required|boolean',
        'tag_id' => 'nullable|string', // Validate tag_id as a comma-separated string
    ]);

    // ✅ Remove `location_id` and `warehouse_id` from array if they are null
    if ($request->location_id === 'null' || $request->location_id === '') {
        unset($validatedData['location_id']);
    }
    if ($request->warehouse_id === 'null' || $request->warehouse_id === '') {
        unset($validatedData['warehouse_id']);
    }
    if ($request->tag_id === 'null' || $request->tag_id === '') {
        $request->tag_id = "";
    }


    // ✅ Handle image upload or removal
    if ($request->hasFile('image')) {
        // Save new image
        $imagePath = $request->file('image')->store('products', 'public');
        $validatedData['image_url'] = asset("storage/{$imagePath}");
    } elseif ($request->input('image') === null) {
        // Remove image reference if explicitly set to null
        $validatedData['image_url'] = null;
    }

    // ✅ Assign logged-in user
    $validatedData['created_by'] = auth()->id();
    $validatedData['updated_by'] = auth()->id();

    // ✅ Set default status_id
    $validatedData['status_id'] = 1;

    // ✅ Create product
    $product = Product::create($validatedData);

    // ✅ Modify Tag Handling: If `tag_id` is empty/null, delete all tags
    if (!empty($request->tag_id)) {
        $tagIds = explode(',', $request->tag_id);
        $product->tags()->sync($tagIds);
    } else {
        // If `tag_id` is empty or null, remove all tags
        $product->tags()->detach();
    }


    return response()->json([
        'message' => 'Product successfully created',
        'product' => $product
    ], 201);
}
    /**
     * Display the specified product.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
    public function show(Product $product)
    {
        return response()->json($product);
    }

    /**
     * Update the specified product in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Product $product)
    {
        // Handle `_method=PUT` workaround
        if ($request->has('_method') && $request->_method === 'PUT') {
            $request->setMethod('PUT');
        }

        // Convert 'is_machine' to boolean before validation
        $request->merge([
            'is_machine' => filter_var($request->input('is_machine'), FILTER_VALIDATE_BOOLEAN),
        ]);

        // Manually extract request fields
        $validatedData = [
            'name' => $request->input('name', $product->name),
            'model' => $request->input('model', $product->model),
            'description' => $request->input('description', $product->description),
            'product_unit_id' => $request->input('product_unit_id', $product->product_unit_id),
            'minimum_quantity' => $request->input('minimum_quantity', $product->minimum_quantity),
            'profit_margin' => $request->input('profit_margin', $product->profit_margin),
            'supplier_id' => $request->input('supplier_id', $product->supplier_id),
            'supplier_price' => $request->input('supplier_price', $product->supplier_price),
            'location_id' => $request->input('location_id', $product->location_id),
            'warehouse_id' => $request->input('warehouse_id', $product->warehouse_id),
            'is_machine' => $request->input('is_machine', $product->is_machine),
            'status_id' => $request->input('status_id', $product->status_id),
            'updated_by' => auth()->id(),
        ];

        if ($request->location_id === 'null' || $request->location_id === '') {
            unset($validatedData['location_id']);
        }
        if ($request->warehouse_id === 'null' || $request->warehouse_id === '') {
            unset($validatedData['warehouse_id']);
        }
        if ($request->tag_id === 'null' || $request->tag_id === '') {
            $request->tag_id = "";
        }

        // ✅ Handle Image Upload (Remove Image If `null`)
        if ($request->hasFile('image')) {
            // Save new image
            $newImagePath = $request->file('image')->store('products', 'public');
            $validatedData['image_url'] = asset("storage/{$newImagePath}");

            // Delete old image if a new image is uploaded
            if ($product->image_url) {
                $oldImagePath = str_replace(asset('storage'), 'storage', $product->image_url);
                if (file_exists(public_path($oldImagePath))) {
                    unlink(public_path($oldImagePath));
                }
            }
        } elseif ($request->input('image') == "null" && $product->image_url) {
            // Remove image if explicitly set to `null`
            $oldImagePath = str_replace(asset('storage'), 'storage', $product->image_url);
            if (file_exists(public_path($oldImagePath))) {
                unlink(public_path($oldImagePath)); // Remove existing file
            }
            $validatedData['image_url'] = null; // Remove image reference from DB
        }

        // Force update to apply changes
        $product->forceFill($validatedData)->save();

        // ✅ Modify Tag Handling: If `tag_id` is empty/null, delete all tags
        if (!empty($request->tag_id)) {
            $tagIds = explode(',', $request->tag_id);
            $product->tags()->sync($tagIds);
        } else {
            // If `tag_id` is empty or null, remove all tags
            $product->tags()->detach();
        }

        return response()->json([
            'message' => 'Product successfully updated',
            'product' => $product->fresh(),
        ]);
    }
    /**
     * Remove the specified product from storage.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(null, 204);
    }
}
