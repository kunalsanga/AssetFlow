import { Allocation, TransferRequest } from '../types/allocation';

export const mockAllocations: Allocation[] = [
  {
    id: 1,
    asset_id: 1,
    allocated_to_type: "user",
    allocated_to_id: 1,
    allocated_by_id: 2,
    allocated_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    due_date: new Date(Date.now() + 86400000 * 30).toISOString(),
    status: "active",
    asset: {
      id: 1,
      name: "MacBook Pro 16\"",
      serial_number: "AF-MBP-001",
      model: "M2 Max 2023",
      status: "ALLOCATED"
    },
    allocated_by: {
      id: 2,
      full_name: "John Smith",
      email: "john@company.com",
      role: "admin"
    }
  }
];

export const mockTransferRequests: TransferRequest[] = [
  {
    id: 1,
    allocation_id: 1,
    requested_by_id: 1,
    target_type: "user",
    target_id: 3,
    status: "pending",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    requested_by: {
      id: 1,
      full_name: "Sarah Connor",
      email: "sarah@company.com",
      role: "employee"
    },
    allocation: mockAllocations[0]
  }
];
