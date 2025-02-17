export interface Item {
  _id: string;
  serialNumber: string;
  product: {
    _id: string;
    name: string;
    model: string;
    manufacturer: string;
  };
  status: 'inventory' | 'demo' | 'delivery' | 'maintenance';
  purchaseInfo?: {
    date: Date;
    cost?: number;
    supplier?: string;
    orderReference?: string;
  };
  lastMaintenance?: {
    date: Date;
    type: string;
    description: string;
  };
  warranty?: {
    startDate: Date;
    endDate: Date;
    claimHistory: Array<{
      date: Date;
      description: string;
      status: string;
      resolution: string;
    }>;
  };
  maintenanceHistory: Array<{
    date: Date;
    type: string;
    description: string;
    performedBy: string;
    nextDueDate?: Date;
    cost?: number;
    attachments?: string[];
  }>;
  calibrationHistory: Array<{
    date: Date;
    notes: string;
    performedBy: string;
    nextDueDate: Date;
    results: string;
    certificate?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}
