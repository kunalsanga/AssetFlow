import { Booking } from '../types/booking';

export const mockBookings: Booking[] = [
  {
    id: 1,
    asset_id: 1,
    user_id: 1,
    start_time: new Date(Date.now() + 86400000).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: 'UPCOMING',
    asset: {
      id: 1,
      name: "Conference Room A",
      serial_number: "RM-A-01",
      model: "Meeting Room",
      status: "AVAILABLE"
    },
    user: {
      id: 1,
      full_name: "Sarah Connor",
      email: "sarah@company.com",
      role: "employee"
    }
  },
  {
    id: 2,
    asset_id: 2,
    user_id: 2,
    start_time: new Date(Date.now() - 3600000).toISOString(),
    end_time: new Date(Date.now() + 3600000).toISOString(),
    status: 'ONGOING',
    asset: {
      id: 2,
      name: "Projector AF-PROJ-12",
      serial_number: "AF-PROJ-12",
      model: "Epson Pro EX9220",
      status: "AVAILABLE"
    },
    user: {
      id: 2,
      full_name: "John Smith",
      email: "john@company.com",
      role: "department_head"
    }
  }
];
