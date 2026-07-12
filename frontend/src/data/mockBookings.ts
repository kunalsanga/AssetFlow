export const MOCK_RESOURCES = [
  { id: '1', name: 'Conference Room B2', type: 'Room', capacity: 12, location: 'Floor 1' },
  { id: '2', name: 'Conference Room A', type: 'Room', capacity: 8, location: 'Floor 1' },
  { id: '3', name: 'Projector 4K', type: 'Equipment', capacity: null, location: 'IT Dept' }
];

const today = new Date();
const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

export const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const INITIAL_BOOKINGS = [
  { id: '101', resourceId: '1', date: formatDate(today), title: 'Booked - Procurement Team', start: '09:00', end: '10:00', user: 'Procurement Team', color: 'bg-[#1a4b6e] text-white border-transparent' },
  { id: '102', resourceId: '1', date: formatDate(today), title: 'Requested 9:30 to 10:30 - conflict - slot is unavailable', start: '09:30', end: '10:30', user: 'Sales Team', color: 'bg-transparent text-white border-red-400 border-dashed border-2 z-10', conflict: true },
  { id: '103', resourceId: '1', date: formatDate(tomorrow), title: 'Design Sync', start: '13:00', end: '14:30', user: 'Alex W.', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: '104', resourceId: '2', date: formatDate(today), title: 'Client Meeting', start: '10:00', end: '12:00', user: 'John D.', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: '105', resourceId: '1', date: formatDate(yesterday), title: 'Weekly Standup', start: '09:30', end: '10:30', user: 'Dev Team', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' }
];

export const MOCK_PROJECTS = [
  { id: '1', name: 'Mobile App Design', team: ['SR', 'MK', 'AL'], progress: 75, date: '12 JUN 2019', color: 'text-orange-500', stroke: '#f97316' },
  { id: '2', name: 'Demon Website Redesign', team: ['JD', 'SR'], progress: 30, date: '12 JUN 2019', color: 'text-amber-500', stroke: '#f59e0b' },
  { id: '3', name: 'Website Development', team: ['AL', 'JD', 'MK'], progress: 50, date: '12 JUN 2019', color: 'text-emerald-500', stroke: '#10b981' }
];
