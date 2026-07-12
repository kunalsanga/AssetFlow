import { AuditCycle, AuditItem } from '../types/audit';

export const mockAuditCycles: AuditCycle[] = [
  {
    id: 1,
    name: "Q3 IT Equipment Audit",
    start_date: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: "ACTIVE",
    auditor_id: 1,
    auditor: {
      id: 1,
      full_name: "Sarah Connor",
      email: "sarah@company.com",
      role: "admin"
    }
  }
];

export const mockAuditItems: AuditItem[] = [
  {
    id: 1,
    cycle_id: 1,
    asset_id: 1,
    status: "VERIFIED",
    verified_at: new Date(Date.now() - 86400000).toISOString(),
    asset: {
      id: 1,
      name: "MacBook Pro 16\"",
      serial_number: "AF-MBP-001",
      model: "M2 Max 2023",
      status: "AVAILABLE"
    }
  },
  {
    id: 2,
    cycle_id: 1,
    asset_id: 7,
    status: "MISSING",
    notes: "Not found at assigned desk",
    asset: {
      id: 7,
      name: "iPad Pro 12.9\"",
      serial_number: "AF-IPD-005",
      model: "6th Generation",
      status: "ALLOCATED"
    }
  }
];
