<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Mike42\Escpos\Printer;
use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;
use Exception; // Ensure Exception is properly imported

class PrintReceipt extends Command
{
    protected $signature = 'print:receipt {printer_name}';
    protected $description = 'Print a receipt using an ESC/POS printer';

    public function handle()
    {
        try {
            // Get the printer name dynamically from command input
            $printerName = $this->argument('printer_name');

            // Establish connection with the given printer
            $connector = new WindowsPrintConnector($printerName);
            $printer = new Printer($connector);

            // Print test message
            $printer->text("Hello, this is a test print!\n");
            $printer->cut();
            $printer->close();

            $this->info("Print job sent successfully to '{$printerName}'");

        } catch (Exception $e) {
            $this->error("Printing failed: " . $e->getMessage());
        }
    }
}