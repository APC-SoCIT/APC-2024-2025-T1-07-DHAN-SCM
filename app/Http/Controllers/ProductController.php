<?php

namespace App\Http\Controllers;

use Log;
use Storage;
use Carbon\Carbon;
use App\Models\Order;
use App\Models\Product;
use App\Models\DemoUnit;
use App\Models\ProductType;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\OutgoingStock;
use App\Models\PurchaseOrder;
use App\Models\SupplierProduct;
use App\Models\PurchaseOrderItem;
use Illuminate\Http\UploadedFile;

class ProductController extends Controller
{

   
    public function productLogs($productId)
    {
        // Fetch product with incoming and outgoing stocks
        $product = Product::with(['incomingStocks', 'outgoingStocks'])->findOrFail($productId);
    
        $logs = collect();
    
        // ✅ Group Incoming Stock Entries by `purchase_order_item_id`
        $incomingGrouped = $product->incomingStocks->groupBy('purchase_order_item_id');
        foreach ($incomingGrouped as $poItemId => $stocks) {
            $purchaseOrderId = PurchaseOrderItem::where('id', $poItemId)->value('purchase_order_id');
            $poNumber = $purchaseOrderId ? PurchaseOrder::where('id', $purchaseOrderId)->value('ponumber') : 'No PO Found';
            $type = Str::startsWith($poNumber, 'I-P') ? 'Internal P.O' : (Str::startsWith($poNumber, 'N-P') ? 'Normal P.O' : 'Received Stock');
    
            $logs->push([
                'name' => $product->name,
                'quantity' => $stocks->count(),
                'Adjustment' => 'Increase (+)',
                'timestamp' => $stocks->max('created_at')->toDateTimeString(),
                'reference_number' => $poNumber,
                'type' => $type,
            ]);
        }
    
        // ✅ Separate Outgoing Stock Entries by `demo_unit_id`
        $demoOutgoingGrouped = $product->outgoingStocks->whereNotNull('demo_unit_id')->groupBy('demo_unit_id');
        foreach ($demoOutgoingGrouped as $demoId => $stocks) {
            $demoNumber = DemoUnit::where('id', $demoId)->value('demo_number');
    
            $logs->push([
                'name' => $product->name,
                'quantity' => $stocks->count(),
                'Adjustment' => 'Decrease (-)',
                'timestamp' => $stocks->max('created_at')->toDateTimeString(),
                'reference_number' => $demoNumber ?? 'N/A',
                'type' => 'Demo',
            ]);
        }
    
        // ✅ Separate Outgoing Stock Entries by `order_item_id`
        $orderOutgoingGrouped = $product->outgoingStocks->whereNotNull('order_item_id')->groupBy('order_item_id');
        foreach ($orderOutgoingGrouped as $orderItemId => $stocks) {
            $orderNumber = Order::whereHas('orderItems', function ($query) use ($orderItemId) {
                $query->where('id', $orderItemId);
            })->value('megaion_order_number');
    
            $logs->push([
                'name' => $product->name,
                'quantity' => $stocks->count(),
                'Adjustment' => 'Decrease (-)',
                'timestamp' => $stocks->max('created_at')->toDateTimeString(),
                'reference_number' => $orderNumber ?? 'N/A',
                'type' => 'Ordered',
            ]);
        }
    
        return response()->json($logs->sortByDesc('timestamp')->values()->toArray());
    }
    public function getAllProducts1($productId = null)  
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
                ->reject(fn($stock) => OutgoingStock::where('incoming_stock_id', $stock->id)->exists()) // Exclude stocks already in OutgoingStock
                ->filter(fn($stock) => is_null($stock->expiration_date) || !Carbon::parse($stock->expiration_date)->isPast()) 
                ->sum('quantity'); 

                $filteredIncomingStocks = $product->incomingStocks
                ->reject(fn($stock) => OutgoingStock::where('incoming_stock_id', $stock->id)->exists())
                ->sortBy(fn($stock) => $stock->expiration_date ?? $stock->created_at);
                
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


    public function getAllProducts2($productId = null)
    {
        // Preload all relevant OutgoingStock IDs to avoid N+1 queries
        $outgoingStockIds = OutgoingStock::pluck('incoming_stock_id')->toArray();

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

        if ($productId !== null) {
            $query->where('id', $productId);
        }

        $products = $query->get()->map(function ($product) use ($outgoingStockIds) {
            // Filter out outgoing stocks
            $incomingStocks = $product->incomingStocks->reject(
                fn($stock) => in_array($stock->id, $outgoingStockIds)
            );

            $availableQuantity = $incomingStocks
                ->filter(fn($stock) => is_null($stock->expiration_date) || !Carbon::parse($stock->expiration_date)->isPast())
                ->sum('quantity');

            $filteredIncomingStocks = $incomingStocks->sortBy(
                fn($stock) => $stock->expiration_date ?? $stock->created_at
            );

            $groupedStocks = $filteredIncomingStocks->isNotEmpty()
                ? $filteredIncomingStocks->groupBy(fn($stock) => implode('|', [
                    $stock->purchase_order_item_id,
                    $stock->serial_number ?? 'NULL',
                    $stock->lot_number ?? 'NULL',
                    $stock->expiration_date ?? 'NULL',
                    $stock->product_id
                ]))->map(function ($stocks) use ($product) {
                    $firstStock = $stocks->first();
                    $quantity = $stocks->sum('quantity');
                    $remainingTimeString = null;
                    $status = 'In Stock';

                    if (!$product->is_machine) {
                        $expirationDate = $firstStock->expiration_date ? Carbon::parse($firstStock->expiration_date) : null;
                        $today = Carbon::today();

                        if (!$expirationDate || !$firstStock->lot_number) {
                            $status = 'INSTOCK';
                        } else {
                            $remainingTime = $today->diff($expirationDate);

                            if ($expirationDate->isPast()) {
                                $status = 'EXPIRED';
                                $remainingTimeString = 'Expired ' . $remainingTime->y . ' Years, ' . $remainingTime->m . ' Months, and ' . $remainingTime->d . ' Days Ago';
                            } elseif ($expirationDate->greaterThan($today->copy()->addMonths(3))) {
                                $status = 'VIABLE';
                                $remainingTimeString = 'Expires in ' . $remainingTime->y . ' Years, ' . $remainingTime->m . ' Months, and ' . $remainingTime->d . ' Days';
                            } else {
                                $status = 'EXPIRING';
                                $remainingTimeString = 'Expiring in ' . $remainingTime->m . ' Months and ' . $remainingTime->d . ' Days';
                            }
                        }
                    }
                    // Calibration & Maintenance records — always initialize
                    $calibrationRecords = $firstStock->calibrationRecords
                        ->sortByDesc('calibration_date')
                        ->map(fn($r) => [
                            'calibration_date' => $r->calibration_date,
                            'calibrated_by' => $r->calibrated_by,
                            'calibration_notes' => $r->calibration_notes,
                            'calibration_status_id' => $r->calibration_status_id
                        ])->values();

                    $maintenanceRecords = $firstStock->maintenanceRecords
                        ->sortByDesc('maintenance_date')
                        ->map(fn($r) => [
                            'maintenance_date' => $r->maintenance_date,
                            'next_maintenance_date' => $r->next_maintenance_date,
                            'performed_by' => $r->performed_by,
                            'description' => $r->description
                        ])->values();

                    // Always define flags, even for non-machines
                    $forCalibration = false;
                    $forMaintenance = false;

                    if ($product->is_machine) {
                        $latestCalibration = $calibrationRecords->first();
                        $forCalibration = !$latestCalibration;

                        $latestMaintenance = $maintenanceRecords->first();
                        $nextMaintenanceDate = $latestMaintenance['next_maintenance_date'] ?? null;
                        $forMaintenance = $nextMaintenanceDate
                            ? Carbon::today()->diffInDays(Carbon::parse($nextMaintenanceDate)) < 30
                            : false;
                    }

                    return [
                        'purchase_order_item_id' => $firstStock->purchase_order_item_id,
                        'serial_number' => $firstStock->serial_number,
                        'lot_number' => $firstStock->lot_number,
                        'expiration_date' => $firstStock->expiration_date,
                        'product_id' => $firstStock->product_id,
                        'quantity' => $quantity,
                        'status' => $status,
                        'remaining_time' => $remainingTimeString,
                        'barcodes' => $stocks->pluck('barcode')->all(),
                        'calibration_records' => $calibrationRecords->toArray(),
                        'for_calibration' => (bool) $forCalibration,
                        'maintenance_records' => $maintenanceRecords->toArray(),
                        'for_maintenance' => (bool) $forMaintenance
                    ];
                })->values()
                : collect();

            // Totals
            $totalForCalibration = $product->is_machine
                ? $groupedStocks->where('for_calibration', true)->count()
                : 0;

            $totalForMaintenance = $product->is_machine
                ? $groupedStocks->where('for_maintenance', true)->count()
                : 0;

            $totalDemoUnits = $product->is_machine
                ? DemoUnit::whereIn('incoming_stock_id', $product->incomingStocks->pluck('id'))->count()
                : 0;

            return array_merge($product->toArray(), [
                'available_quantity' => $availableQuantity,
                'quantity_level' => $availableQuantity == 0
                    ? 'No Stock'
                    : ($availableQuantity < $product->minimum_quantity ? 'Below Minimum' : 'Above Minimum'),
                'default_selling_price' => number_format(
                    $product->supplier_price + ($product->supplier_price * ($product->profit_margin / 100)),
                    2,
                    '.',
                    ''
                ),
                'incoming_stocks' => $groupedStocks->toArray(),
                'total_for_calibration' => $totalForCalibration,
                'total_for_maintenance' => $totalForMaintenance,
                'total_demo_units' => $totalDemoUnits
            ]);
        });

       return response()->json(
            $productId !== null 
                ? $products->first() 
                : $products->sortByDesc('available_quantity')->values()
        );

    }

    public function getAllProducts($productId = null)
    {
        // Load products with eager loading of relations and filtered incomingStocks
        // Use withCount to avoid N+1 for DemoUnits count
        
        $query = Product::with([
            'productUnit',
            'supplier',
            'location',
            'warehouse',
            'status',
            'creator',
            'updater',
            'tags',
            // Load incomingStocks with calibration and maintenance eager loaded
            'incomingStocks' => function($q) {
                // Only incomingStocks that are NOT outgoing (join with outgoing_stocks)
                $q->whereDoesntHave('outgoingStocks')
                ->with(['calibrationRecords' => function($qr) {
                    $qr->orderByDesc('calibration_date');
                }, 'maintenanceRecords' => function($qr) {
                    $qr->orderByDesc('maintenance_date');
                }]);
            },
        ])->withCount(['demoUnits']); // preload count of demo units per product

        if ($productId !== null) {
            $query->where('id', $productId);
        }

        $products = $query->get()->map(function ($product) {
            // Filter out expired incoming stocks here (avoid parsing date multiple times)
            $today = Carbon::today();

            $validStocks = $product->incomingStocks->filter(function ($stock) use ($today) {
                return is_null($stock->expiration_date) || !Carbon::parse($stock->expiration_date)->isPast();
            });

            $availableQuantity = $validStocks->sum('quantity');

            // Sort stocks by expiration_date or created_at once
            $filteredIncomingStocks = $validStocks->sortBy(function ($stock) {
                return $stock->expiration_date ?? $stock->created_at;
            });

            // Group stocks by combined keys
            $groupedStocks = $filteredIncomingStocks->groupBy(function ($stock) {
                return implode('|', [
                    $stock->purchase_order_item_id,
                    $stock->serial_number ?? 'NULL',
                    $stock->lot_number ?? 'NULL',
                    $stock->expiration_date ?? 'NULL',
                    $stock->product_id,
                ]);
            })->map(function ($stocks) use ($product, $today) {
                $firstStock = $stocks->first();
                $quantity = $stocks->sum('quantity');
                $status = 'In Stock';
                $remainingTimeString = null;

                if (!$product->is_machine) {
                    $expirationDate = $firstStock->expiration_date ? Carbon::parse($firstStock->expiration_date) : null;
                    if (!$expirationDate || !$firstStock->lot_number) {
                        $status = 'INSTOCK';
                    } else {
                        $remainingTime = $today->diff($expirationDate);
                        if ($expirationDate->isPast()) {
                            $status = 'EXPIRED';
                            $remainingTimeString = 'Expired ' . $remainingTime->y . ' Years, ' . $remainingTime->m . ' Months, and ' . $remainingTime->d . ' Days Ago';
                        } elseif ($expirationDate->greaterThan($today->copy()->addMonths(3))) {
                            $status = 'VIABLE';
                            $remainingTimeString = 'Expires in ' . $remainingTime->y . ' Years, ' . $remainingTime->m . ' Months, and ' . $remainingTime->d . ' Days';
                        } else {
                            $status = 'EXPIRING';
                            $remainingTimeString = 'Expiring in ' . $remainingTime->m . ' Months and ' . $remainingTime->d . ' Days';
                        }
                    }
                }

                // Latest calibration and maintenance records already sorted desc
                $latestCalibration = $firstStock->calibrationRecords->first();
                $calibrationRecords = $firstStock->calibrationRecords->map(fn($r) => [
                    'calibration_date' => $r->calibration_date,
                    'calibrated_by' => $r->calibrated_by,
                    'calibration_notes' => $r->calibration_notes,
                    'calibration_status_id' => $r->calibration_status_id,
                ])->values();

                $latestMaintenance = $firstStock->maintenanceRecords->first();
                $maintenanceRecords = $firstStock->maintenanceRecords->map(fn($r) => [
                    'maintenance_date' => $r->maintenance_date,
                    'next_maintenance_date' => $r->next_maintenance_date,
                    'performed_by' => $r->performed_by,
                    'description' => $r->description,
                ])->values();

                // Flags for calibration & maintenance for machines
                $forCalibration = $product->is_machine && !$latestCalibration;
                $forMaintenance = false;
                if ($product->is_machine && $latestMaintenance) {
                    $nextMaintenanceDate = $latestMaintenance->next_maintenance_date;
                    if ($nextMaintenanceDate) {
                        $forMaintenance = $today->diffInDays(Carbon::parse($nextMaintenanceDate)) < 30;
                    }
                }

                return [
                    'purchase_order_item_id' => $firstStock->purchase_order_item_id,
                    'serial_number' => $firstStock->serial_number,
                    'lot_number' => $firstStock->lot_number,
                    'expiration_date' => $firstStock->expiration_date,
                    'product_id' => $firstStock->product_id,
                    'quantity' => $quantity,
                    'status' => $status,
                    'remaining_time' => $remainingTimeString,
                    'barcodes' => $stocks->pluck('barcode')->all(),
                    'calibration_records' => $calibrationRecords->toArray(),
                    'for_calibration' => (bool) $forCalibration,
                    'maintenance_records' => $maintenanceRecords->toArray(),
                    'for_maintenance' => (bool) $forMaintenance,
                ];
            })->values();

            $totalForCalibration = $product->is_machine
                ? $groupedStocks->where('for_calibration', true)->count()
                : 0;

            $totalForMaintenance = $product->is_machine
                ? $groupedStocks->where('for_maintenance', true)->count()
                : 0;

            // Use preloaded demo_units_count to avoid query inside loop
            $totalDemoUnits = $product->is_machine ? $product->demo_units_count : 0;

            return array_merge($product->toArray(), [
                'available_quantity' => $availableQuantity,
                'quantity_level' => $availableQuantity == 0
                    ? 'No Stock'
                    : ($availableQuantity < $product->minimum_quantity ? 'Below Minimum' : 'Above Minimum'),
                'default_selling_price' => number_format(
                    $product->supplier_price + ($product->supplier_price * ($product->profit_margin / 100)),
                    2,
                    '.',
                    ''
                ),
                'incoming_stocks' => $groupedStocks->toArray(),
                'total_for_calibration' => $totalForCalibration,
                'total_for_maintenance' => $totalForMaintenance,
                'total_demo_units' => $totalDemoUnits,
            ]);
        });

        return response()->json(
            $productId !== null
                ? $products->first()
                : $products->sortByDesc('available_quantity')->values()
        );
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
        if ($request->input('image') === null) {
            $request->request->remove('image');
        }
    
        $request->merge([
            'is_machine' => filter_var($request->is_machine, FILTER_VALIDATE_BOOLEAN),
        ]);
    
        $imageRules = $request->hasFile('image') ? 'file|image|mimes:jpeg,png,jpg,gif|max:2048' : 'nullable';
    
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'model' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'product_unit_id' => 'required|exists:product_units,id',
            'minimum_quantity' => 'required|integer|min:0',
            'profit_margin' => 'required|numeric|min:0|max:100',
            'image' => $imageRules,
            'supplier_id' => 'nullable|exists:suppliers,id',
            'supplier_price' => 'required|numeric|min:0',
            'location_id' => 'nullable',
            'warehouse_id' => 'nullable',
            'is_machine' => 'required|boolean',
            'tag_id' => 'nullable|string',
        ]);
    
        if ($request->location_id === 'null' || $request->location_id === '') {
            unset($validatedData['location_id']);
        }
        if ($request->warehouse_id === 'null' || $request->warehouse_id === '') {
            unset($validatedData['warehouse_id']);
        }
        if ($request->tag_id === 'null' || $request->tag_id === '') {
            $request->tag_id = "";
        }
    
        // ✅ **Make Image Accessible in Public Folder**
        if ($request->hasFile('image')) {
            $imageName = time() . '_' . $request->file('image')->getClientOriginalName();
            $imagePath = public_path('products/' . $imageName);
            $request->file('image')->move(public_path('products'), $imageName);
            $validatedData['image_url'] = url("products/{$imageName}");
        } elseif ($request->input('image') === null) {
            $validatedData['image_url'] = null;
        }
    
        $validatedData['created_by'] = auth()->id();
        $validatedData['updated_by'] = auth()->id();
        $validatedData['status_id'] = 1;
    
        $product = Product::create($validatedData);
    
        if (!empty($request->tag_id)) {
            $tagIds = explode(',', $request->tag_id);
            $product->tags()->sync($tagIds);
        } else {
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
        if ($request->has('_method') && $request->_method === 'PUT') {
            $request->setMethod('PUT');
        }

        $request->merge([
            'is_machine' => filter_var($request->input('is_machine'), FILTER_VALIDATE_BOOLEAN),
        ]);

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

        // ✅ **Handle Image Upload (Save Image in Public)**
        if ($request->hasFile('image')) {
            // Generate unique image name
            $imageName = time() . '_' . $request->file('image')->getClientOriginalName();
            $imagePath = public_path('products/' . $imageName);

            // Move image to public/products/
            $request->file('image')->move(public_path('products'), $imageName);
            $validatedData['image_url'] = url("products/{$imageName}");

            // Delete old image if a new image is uploaded
            if ($product->image_url) {
                $oldImagePath = public_path('products/' . basename($product->image_url));
                if (file_exists($oldImagePath)) {
                    unlink($oldImagePath);
                }
            }
        } elseif ($request->input('image') == "null" && $product->image_url) {
            // Remove image if explicitly set to `null`
            $oldImagePath = public_path('products/' . basename($product->image_url));
            if (file_exists($oldImagePath)) {
                unlink($oldImagePath);
            }
            $validatedData['image_url'] = null; // Remove image reference from DB
        }

        $product->forceFill($validatedData)->save();

        if (!empty($request->tag_id)) {
            $tagIds = explode(',', $request->tag_id);
            $product->tags()->sync($tagIds);
        } else {
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
