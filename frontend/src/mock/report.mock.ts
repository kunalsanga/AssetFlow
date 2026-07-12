import { ReportDashboardSummary } from '../types/report';

export const mockReportSummary: ReportDashboardSummary = {
  utilization_by_department: [
    { department_name: "Engineering", total_assets: 150, allocated_assets: 120, utilization_rate: 80 },
    { department_name: "Sales", total_assets: 50, allocated_assets: 45, utilization_rate: 90 },
    { department_name: "Design", total_assets: 30, allocated_assets: 25, utilization_rate: 83 },
    { department_name: "Marketing", total_assets: 40, allocated_assets: 30, utilization_rate: 75 }
  ],
  maintenance_frequency: [
    { month: "Jan", request_count: 10 },
    { month: "Feb", request_count: 12 },
    { month: "Mar", request_count: 8 },
    { month: "Apr", request_count: 15 },
    { month: "May", request_count: 5 },
    { month: "Jun", request_count: 20 }
  ],
  most_used_assets: [
    { asset_tag: "AF-PROJ-12", name: "Projector AF-PROJ-12", usage_count: 45, usage_type: "booking" },
    { asset_tag: "RM-A-01", name: "Conference Room A", usage_count: 38, usage_type: "booking" },
    { asset_tag: "AF-IPD-005", name: "iPad Pro 12.9\"", usage_count: 25, usage_type: "allocation" }
  ],
  idle_assets: [
    { asset_tag: "AF-PRN-002", name: "Epson EcoTank Pro ET-5850", idle_days: 120 },
    { asset_tag: "AF-FUR-012", name: "Herman Miller Aeron Chair", idle_days: 45 }
  ],
  maintenance_due: [
    { asset_tag: "AF-MBP-001", name: "MacBook Pro 16\"", status_message: "Due in 5 days" },
    { asset_tag: "AF-TP-088", name: "ThinkPad X1 Carbon Gen 10", status_message: "Overdue by 2 days" }
  ]
};
