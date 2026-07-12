import React from 'react';
import { X } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  newBooking: { title: string, start: string, end: string, user: string };
  setNewBooking: (booking: any) => void;
}

export const BookingModal = ({ isOpen, onClose, onSave, newBooking, setNewBooking }: BookingModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">New Booking</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Booking Title</label>
            <input 
              type="text" 
              value={newBooking.title}
              onChange={(e) => setNewBooking({...newBooking, title: e.target.value})}
              placeholder="e.g. Q4 Strategy Meeting"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Time</label>
              <input 
                type="time" 
                value={newBooking.start}
                onChange={(e) => setNewBooking({...newBooking, start: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Time</label>
              <input 
                type="time" 
                value={newBooking.end}
                onChange={(e) => setNewBooking({...newBooking, end: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
              Cancel
            </button>
            <button onClick={onSave} className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200">
              Save Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
