import { MaintenanceRequest } from '../types/maintenance';

export const mockMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: 1,
    asset_id: 3,
    requester_id: 1,
    description: "Battery not holding charge",
    priority: "HIGH",
    status: "PENDING",
    scheduled_date: new Date(Date.now() + 86400000).toISOString(),
    asset: {
      id: 3,
      name: "ThinkPad X1 Carbon Gen 10",
      serial_number: "AF-TP-088",
      model: "21CB000GUS",
      status: "UNDER_MAINTENANCE"
    },
    requester: {
      id: 1,
      full_name: "Sarah Connor",
      email: "sarah@company.com",
      role: "employee"
    }
  },
  {
    id: 2,
    asset_id: 4,
    requester_id: 2,
    description: "Scroll wheel not working",
    priority: "LOW",
    status: "IN_PROGRESS",
    scheduled_date: new Date(Date.now() - 86400000).toISOString(),
    asset: {
      id: 4,
      name: "Logitech MX Master 3S",
      serial_number: "AF-MOU-102",
      model: "MX Master 3S",
      status: "UNDER_MAINTENANCE"
    },
    requester: {
      id: 2,
      full_name: "John Smith",
      email: "john@company.com",
      role: "department_head"
    }
  }
];
