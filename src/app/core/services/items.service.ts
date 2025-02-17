import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Item } from '../models/item.interface';
import { tap } from 'rxjs/operators';

export interface Activity {
  date: Date;
  type: string;
  serialNumber: string;
  description: string;
}

export interface MaintenanceSchedule {
  serialNumber: string;
  productName: string;
  dueDate: Date;
  maintenanceType: string;
  isOverdue: boolean;
}

export interface CalibrationStats {
  dueCount: number;
  completedThisMonth: number;
  completionRate: number;
}

export interface InventoryReport {
  totalCounts: Record<string, number>;
  productCounts: Array<{
    product: {
      _id: string;
      name: string;
      model: string;
      manufacturer: string;
    };
    statuses: Array<{ status: string; count: number }>;
    totalCount: number;
  }>;
  alerts: {
    maintenanceDue: number;
    warrantyExpiring: number;
  };
  recentActivities: Activity[];
  generatedAt: Date;
  maintenanceTrend: number;
  calibrationStats: CalibrationStats;
  categoryDistribution: Array<{
    name: string;
    value: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private apiUrl = `${environment.apiUrl}/items`;

  constructor(private http: HttpClient) {}

  getAllItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}`);
  }

  getMaintenanceDueItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/maintenance-due`);
  }

  getWarrantyExpiringItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/warranty-expiring`);
  }

  createItem(data: Partial<Item>): Observable<Item> {
    // Log the exact data being sent
    console.log('Creating item with data (raw):', data);
    console.log('Creating item with data (stringified):', JSON.stringify(data));
    
    if (!data.purchaseInfo?.date) {
      throw new Error('Purchase date is required');
    }

    // Create a new object to avoid modifying the input
    const itemData = {
      ...data,
      purchaseInfo: {
        ...data.purchaseInfo,
        // Ensure date is a Date object
        date: new Date(data.purchaseInfo.date)
      }
    };

    // Convert any other dates
    if (itemData.warranty && data.warranty?.startDate && data.warranty?.endDate) {
      itemData.warranty = {
        ...data.warranty,
        startDate: new Date(data.warranty.startDate),
        endDate: new Date(data.warranty.endDate)
      };
    } else {
      delete itemData.warranty; // Remove warranty if dates aren't present
    }
    
    // Log the transformed data
    console.log('Transformed data:', JSON.stringify(itemData, null, 2));
    
    return this.http.post<Item>(`${this.apiUrl}`, itemData).pipe(
      tap({
        next: (response) => console.log('Server response:', response),
        error: (error) => console.error('Error creating item:', error)
      })
    );
  }

  updateItem(id: string, data: Partial<Item>): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/${id}`, data);
  }

  updateStatus(id: string, status: Item['status'], notes?: string): Observable<Item> {
    return this.http.patch<Item>(`${this.apiUrl}/${id}/status`, { status, notes });
  }

  recordMaintenance(id: string, data: {
    type: string;
    description: string;
    performedBy: string;
    nextDueDate: string;
    attachments?: string[];
    cost: number;
  }): Observable<Item> {
    console.log('Sending maintenance data to API:', data);
    return this.http.post<Item>(`${this.apiUrl}/${id}/maintenance`, data);
  }

  recordCalibration(id: string, data: {
    notes: string;
    performedBy: string;
    nextDueDate: string;
    results: string;
    certificate?: string;
  }): Observable<Item> {
    console.log('Sending calibration data to API:', data);
    return this.http.post<Item>(`${this.apiUrl}/${id}/calibration`, data);
  }

  getInventoryReport(): Observable<InventoryReport> {
    return this.http.get<InventoryReport>(`${this.apiUrl}/report`);
  }

  getRecentActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.apiUrl}/activities/recent`);
  }

  getMaintenanceSchedule(): Observable<MaintenanceSchedule[]> {
    return this.http.get<MaintenanceSchedule[]>(`${this.apiUrl}/maintenance/schedule`);
  }


  exportInventoryReport(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/report/export`, { responseType: 'blob' });
  }
}
