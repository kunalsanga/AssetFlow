import React, { useState } from 'react';
import { CalendarClock, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card, CardContent } from '../components/common/Card';
import { cn } from '../lib/utils';
import { MOCK_RESOURCES, INITIAL_BOOKINGS, MOCK_PROJECTS, formatDate } from '../data/mockBookings';
import { OngoingProjects } from '../components/bookings/OngoingProjects';
import { BookingModal } from '../components/bookings/BookingModal';

export const Bookings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState(MOCK_RESOURCES[0].id);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBooking, setNewBooking] = useState({ title: '', start: '10:00', end: '11:00', user: 'Current User' });

  const handleCreateBooking = () => {
    if (!newBooking.title) return;
    const newBookingEntry = {
      id: Math.random().toString(),
      resourceId: selectedResource,
      date: formatDate(currentDate),
      title: newBooking.title,
      start: newBooking.start,
      end: newBooking.end,
      user: newBooking.user,
      color: 'bg-emerald-500 text-white border-transparent'
    };
    setBookings([...bookings, newBookingEntry]);
    setIsModalOpen(false);
    setNewBooking({ title: '', start: '10:00', end: '11:00', user: 'Current User' });
  };

  const filteredResources = MOCK_RESOURCES.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate()));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()));
  const handleDateClick = (day: number) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));

  const shortMonthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const hours = Array.from({ length: 11 }, (_, i) => i + 8);
  const selectedDateStr = formatDate(currentDate);
  const resourceBookings = bookings.filter(b => b.resourceId === selectedResource && b.date === selectedDateStr);

  const timeToPercent = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const totalMinutes = (h - 8) * 60 + m; 
    const maxMinutes = (18 - 8) * 60; 
    return Math.max(0, Math.min(100, (totalMinutes / maxMinutes) * 100));
  };
  
  const durationToPercent = (startStr: string, endStr: string) => {
    const [sh, sm] = startStr.split(':').map(Number);
    const [eh, em] = endStr.split(':').map(Number);
    const durationMins = (eh * 60 + em) - (sh * 60 + sm);
    const maxMinutes = (18 - 8) * 60;
    return (durationMins / maxMinutes) * 100;
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-text tracking-tight">Resource Booking</h1>
          <p className="text-muted mt-1 text-sm">Search resources, select a date, and view the timeline.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-emerald-500 hover:bg-emerald-600 border-none shadow-sm rounded-xl text-white">
          <CalendarClock size={18} />
          New Booking
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-3xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft size={16} className="text-slate-600"/></button>
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">
                  {shortMonthNames[currentDate.getMonth()]} - {currentDate.getFullYear()}
                </h3>
                <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"><ChevronRight size={16} className="text-slate-600"/></button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-3">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-[11px] font-bold text-slate-400 py-1">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-2"></div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = day === currentDate.getDate();
                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(day)}
                      className={cn(
                        "h-8 w-8 mx-auto flex items-center justify-center rounded-full text-xs transition-all",
                        isSelected ? "bg-primary text-white font-bold shadow-md shadow-primary/20" : 
                        "hover:bg-slate-100 text-slate-600 font-medium"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <OngoingProjects projects={MOCK_PROJECTS} />
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-2">
              <div className="flex items-center">
                <div className="px-4 py-2 border-r border-border/40 text-sm font-semibold text-slate-600 shrink-0">Resource</div>
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="Search and select resource..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-10 py-2 bg-transparent text-sm focus:outline-none font-medium text-slate-700"
                  />
                  {searchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 z-50 max-h-48 overflow-y-auto p-2">
                      {filteredResources.map(r => (
                        <button 
                          key={r.id} 
                          onClick={() => { setSelectedResource(r.id); setSearchQuery(''); }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-sm font-medium"
                        >
                          {r.name} <span className="text-xs text-muted font-normal ml-2">({r.type})</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                    {MOCK_RESOURCES.find(r => r.id === selectedResource)?.name} - {shortMonthNames[currentDate.getMonth()]}, {currentDate.getDate()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white min-h-[700px] flex flex-col rounded-3xl">
            <CardContent className="p-6 flex-1 flex">
              <div className="w-full relative flex h-[700px]">
                <div className="w-16 flex flex-col justify-between text-xs font-semibold text-slate-400 py-0 pr-4 shrink-0 h-full relative">
                  {hours.map((hour, i) => (
                    <div key={hour} className="absolute w-full text-right pr-4" style={{ top: `${(i / (hours.length - 1)) * 100}%`, transform: 'translateY(-50%)' }}>
                      {hour}:00
                    </div>
                  ))}
                </div>
                <div className="flex-1 relative border-l border-t border-slate-200">
                  {hours.map((_, i) => (
                    <div key={`h-grid-${i}`} className="absolute left-0 right-0 border-b border-slate-200 w-full" style={{ top: `${(i / (hours.length - 1)) * 100}%` }}></div>
                  ))}
                  {resourceBookings.map((booking: any) => {
                    const top = timeToPercent(booking.start);
                    const height = durationToPercent(booking.start, booking.end);
                    return (
                      <div 
                        key={booking.id}
                        className={cn(
                          "absolute left-4 right-4 rounded-xl border p-3 flex flex-col justify-center overflow-hidden transition-transform cursor-pointer",
                          booking.color,
                          booking.conflict ? "hover:bg-red-50/10" : "shadow-sm hover:shadow-md"
                        )}
                        style={{ 
                          top: `${top}%`, 
                          height: `${height}%`,
                          marginTop: '1px',
                          ...(booking.conflict ? { left: '2rem', right: '1rem' } : {})
                        }}
                      >
                        <div className="font-semibold text-sm truncate">{booking.title}</div>
                        {!booking.conflict && (
                          <div className="text-xs opacity-90 flex items-center gap-1 mt-1 truncate">
                            <Clock size={10} />
                            {booking.start} - {booking.end}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <BookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateBooking}
        newBooking={newBooking}
        setNewBooking={setNewBooking}
      />
    </div>
  );
};
