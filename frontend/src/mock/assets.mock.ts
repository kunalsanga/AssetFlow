import { Asset } from '../types/asset';

export const mockAssets: Asset[] = [
  {
    id: 1,
    name: "MacBook Pro 16\"",
    serial_number: "AF-MBP-001",
    model: "M2 Max 2023",
    status: "AVAILABLE",
    description: "High-performance laptop for engineering team"
  },
  {
    id: 2,
    name: "Dell UltraSharp 32 4K USB-C Hub Monitor",
    serial_number: "AF-MON-024",
    model: "U3223QE",
    status: "ALLOCATED",
    description: "Design team primary display"
  },
  {
    id: 3,
    name: "ThinkPad X1 Carbon Gen 10",
    serial_number: "AF-TP-088",
    model: "21CB000GUS",
    status: "UNDER_MAINTENANCE",
    description: "Sales representative laptop - battery issue"
  },
  {
    id: 4,
    name: "Logitech MX Master 3S",
    serial_number: "AF-MOU-102",
    model: "MX Master 3S",
    status: "AVAILABLE",
    description: "Ergonomic wireless mouse"
  },
  {
    id: 5,
    name: "Keychron K8 Pro",
    serial_number: "AF-KBD-045",
    model: "K8 Pro QMK/VIA",
    status: "ALLOCATED",
    description: "Mechanical keyboard with brown switches"
  },
  {
    id: 6,
    name: "Herman Miller Aeron Chair",
    serial_number: "AF-FUR-012",
    model: "Aeron Size B",
    status: "AVAILABLE",
    description: "Ergonomic office chair in main conference room"
  },
  {
    id: 7,
    name: "iPad Pro 12.9\"",
    serial_number: "AF-IPD-005",
    model: "6th Generation",
    status: "LOST",
    description: "Reported missing after trade show"
  },
  {
    id: 8,
    name: "Epson EcoTank Pro ET-5850",
    serial_number: "AF-PRN-002",
    model: "ET-5850",
    status: "RETIRED",
    description: "Old office printer, replaced by newer model"
  }
];
