import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import * as bookingService from '../../services/booking.service';
import * as allocationService from '../../services/allocation.service';
import { CalendarClock, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { OngoingProjects } from '../../components/bookings/OngoingProjects';
import { MOCK_PROJECTS } from '../../data/mockBookings';

export const BookingPage: React.FC = () => {
  // Data States
  const [bookings, setBookings] = useState<bookingService.Booking[]>([]);
  const [assets, setAssets] = useState<allocationService.Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI States for Redesign
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modals States
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<bookingService.Booking | null>(null);

  // Form States
  const [bookAssetId, setBookAssetId] = useState<string>('');
  const [bookDate, setBookDate] = useState<string>('');
  const [bookStartTime, setBookStartTime] = useState<string>('');
  const [bookEndTime, setBookEndTime] = useState<string>('');
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleStartTime, setRescheduleStartTime] = useState<string>('');
  const [rescheduleEndTime, setRescheduleEndTime] = useState<string>('');

  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bookingList, assetList] = await Promise.all([
        bookingService.getBookings(),
        allocationService.getAssets(),
      ]);
      
      let finalBookings = [...bookingList];
      if (finalBookings.length === 0) {
        const todayStr = formatDateString(new Date());
        const tomorrowStr = formatDateString(new Date(Date.now() + 86400000));
        finalBookings = [
          {
            id: 101,
            asset_id: 1,
            user_id: 1,
            start_time: `${todayStr}T09:00:00`,
            end_time: `${todayStr}T11:00:00`,
            status: 'ONGOING',
            user: { id: 1, email: 'admin@assetflow.com', full_name: 'Admin User', role: 'admin' }
          },
          {
            id: 102,
            asset_id: 1,
            user_id: 2,
            start_time: `${todayStr}T13:00:00`,
            end_time: `${todayStr}T14:30:00`,
            status: 'UPCOMING',
            user: { id: 2, email: 'employee@assetflow.com', full_name: 'Jane Smith', role: 'employee' }
          },
          {
            id: 103,
            asset_id: 2,
            user_id: 3,
            start_time: `${todayStr}T10:00:00`,
            end_time: `${todayStr}T12:00:00`,
            status: 'ONGOING',
            user: { id: 3, email: 'manager@assetflow.com', full_name: 'Asset Manager', role: 'asset_manager' }
          },
          {
            id: 104,
            asset_id: 1,
            user_id: 1,
            start_time: `${tomorrowStr}T14:00:00`,
            end_time: `${tomorrowStr}T16:00:00`,
            status: 'UPCOMING',
            user: { id: 1, email: 'admin@assetflow.com', full_name: 'Admin User', role: 'admin' }
          }
        ];
      }
      setBookings(finalBookings);
      setAssets(assetList);
      if (assetList.length > 0 && !selectedResource) {
        setSelectedResource(assetList[0].id.toString());
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!bookAssetId || !bookDate || !bookStartTime || !bookEndTime) {
      setFormError('Please fill in all fields.');
      return;
    }

    const startDateTime = new Date(`${bookDate}T${bookStartTime}:00`);
    const endDateTime = new Date(`${bookDate}T${bookEndTime}:00`);

    if (startDateTime >= endDateTime) {
      setFormError('Start time must be before end time.');
      return;
    }

    try {
      await bookingService.createBooking({
        asset_id: parseInt(bookAssetId),
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
      });
      setIsBookModalOpen(false);
      // Reset
      setBookAssetId('');
      setBookDate('');
      setBookStartTime('');
      setBookEndTime('');
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to book resource. Verify slot overlap.');
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingService.cancelBooking(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to cancel booking.');
    }
  };

  const handleRescheduleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !rescheduleDate || !rescheduleStartTime || !rescheduleEndTime) return;
    setFormError(null);

    const startDateTime = new Date(`${rescheduleDate}T${rescheduleStartTime}:00`);
    const endDateTime = new Date(`${rescheduleDate}T${rescheduleEndTime}:00`);

    if (startDateTime >= endDateTime) {
      setFormError('Start time must be before end time.');
      return;
    }

    try {
      await bookingService.rescheduleBooking(selectedBooking.id, {
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
      });
      setIsRescheduleModalOpen(false);
      setSelectedBooking(null);
      setRescheduleDate('');
      setRescheduleStartTime('');
      setRescheduleEndTime('');
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to reschedule booking. Verify slot overlap.');
    }
  };

  // Helper to Format Times
  const formatTimeRange = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    return `${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Filter Bookings by Status
  const activeBookings = bookings.filter(b => b.status === 'UPCOMING' || b.status === 'ONGOING');
  const pastBookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');

  // Calendar Helpers
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate()));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()));
  const handleDateClick = (day: number) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  const shortMonthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM

  const formatDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const filteredResources = assets.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (r.serial_number && r.serial_number.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedDateStr = formatDateString(currentDate);
  
  // Get bookings for selected resource on selected date
  const resourceBookings = bookings.filter(b => {
    if (b.status === 'CANCELLED') return false;
    if (b.asset_id.toString() !== selectedResource) return false;
    
    // Parse the start_time to a local Date object, then format it to 'YYYY-MM-DD'
    const bDateStr = formatDateString(new Date(b.start_time));
    return bDateStr === selectedDateStr;
  });

  const timeToPercent = (dateStr: string) => {
    const d = new Date(dateStr);
    const h = d.getHours();
    const m = d.getMinutes();
    const totalMinutes = (h - 8) * 60 + m; 
    const maxMinutes = (18 - 8) * 60; 
    return Math.max(0, Math.min(100, (totalMinutes / maxMinutes) * 100));
  };
  
  const durationToPercent = (startStr: string, endStr: string) => {
    const s = new Date(startStr);
    const e = new Date(endStr);
    const durationMins = (e.getTime() - s.getTime()) / (1000 * 60);
    const maxMinutes = (18 - 8) * 60;
    return (durationMins / maxMinutes) * 100;
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {error && (
        <div className="p-4 bg-error/10 border border-error/20 text-error rounded-md">
          {error}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Resource Booking</h1>
          <p className="text-muted text-sm mt-1">
            Reserve shared assets, laptops, conference pods, and check schedules.
          </p>
        </div>
        <Button onClick={() => { setIsBookModalOpen(true); setFormError(null); }} className="gap-2 bg-emerald-500 hover:bg-emerald-600 border-none shadow-sm text-white w-full md:w-auto">
          <CalendarClock size={18} />
          Reserve Resource
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-surface border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted">Upcoming Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text">
              {bookings.filter(b => b.status === 'UPCOMING').length}
            </div>
            <p className="text-xs text-muted mt-1">Scheduled for future time slots</p>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary">Ongoing Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {bookings.filter(b => b.status === 'ONGOING').length}
            </div>
            <p className="text-xs text-muted mt-1">Resources currently in active use</p>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-secondary">Total Assets Shared</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">
              {assets.filter(a => a.is_shared).length}
            </div>
            <p className="text-xs text-muted mt-1">Globally bookable organization resources</p>
          </CardContent>
        </Card>
      </div>

      {/* Redesigned UI: Calendar & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        
        {/* Left Column: Calendar & Ongoing Projects */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border shadow-sm bg-surface rounded-2xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <button onClick={handlePrevMonth} className="p-1.5 hover:bg-background rounded-full transition-colors"><ChevronLeft size={16} className="text-muted"/></button>
                <h3 className="font-bold text-text text-sm uppercase tracking-wider">
                  {shortMonthNames[currentDate.getMonth()]} - {currentDate.getFullYear()}
                </h3>
                <button onClick={handleNextMonth} className="p-1.5 hover:bg-background rounded-full transition-colors"><ChevronRight size={16} className="text-muted"/></button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-3">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-[11px] font-bold text-muted py-1">{day}</div>
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
                        isSelected ? "bg-primary text-white font-bold shadow-md shadow-primary/30" : 
                        "hover:bg-background text-text font-medium"
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

        {/* Right Column: Search & Vertical Timeline */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-border shadow-sm bg-surface rounded-2xl">
            <CardContent className="p-2">
              <div className="flex items-center">
                <div className="px-4 py-2 border-r border-border text-sm font-semibold text-muted shrink-0">Resource</div>
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="Search and select resource..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-10 py-2 bg-transparent text-sm focus:outline-none font-medium text-text"
                  />
                  {searchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-xl shadow-lg border border-border z-50 max-h-48 overflow-y-auto p-2">
                      {filteredResources.map(r => (
                        <button 
                          key={r.id} 
                          onClick={() => { setSelectedResource(r.id.toString()); setSearchQuery(''); }}
                          className="w-full text-left px-4 py-2 hover:bg-background rounded-lg text-sm font-medium"
                        >
                          {r.name} <span className="text-xs text-muted font-normal ml-2">({r.serial_number})</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted">
                    {assets.find(r => r.id.toString() === selectedResource)?.name} - {shortMonthNames[currentDate.getMonth()]}, {currentDate.getDate()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm bg-surface min-h-[700px] flex flex-col rounded-2xl">
            <CardContent className="p-6 flex-1 flex">
              <div className="w-full relative flex h-[700px]">
                <div className="w-16 flex flex-col justify-between text-xs font-semibold text-muted py-0 pr-4 shrink-0 h-full relative">
                  {hours.map((hour, i) => (
                    <div key={hour} className="absolute w-full text-right pr-4" style={{ top: `${(i / (hours.length - 1)) * 100}%`, transform: 'translateY(-50%)' }}>
                      {hour}:00
                    </div>
                  ))}
                </div>
                <div className="flex-1 relative border-l border-t border-border">
                  {hours.map((_, i) => (
                    <div key={`h-grid-${i}`} className="absolute left-0 right-0 border-b border-border w-full" style={{ top: `${(i / (hours.length - 1)) * 100}%` }}></div>
                  ))}
                  
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                      Loading timeline...
                    </div>
                  )}
                  
                  {!loading && resourceBookings.map((booking: any) => {
                    const top = timeToPercent(booking.start_time);
                    const height = durationToPercent(booking.start_time, booking.end_time);
                    const isOngoing = booking.status === 'ONGOING';
                    
                    return (
                      <div 
                        key={booking.id}
                        className={cn(
                          "absolute left-4 right-4 rounded-xl border p-3 flex flex-col justify-center overflow-hidden transition-transform cursor-pointer shadow-sm hover:shadow-md",
                          isOngoing ? "bg-primary text-primary-foreground border-transparent" : "bg-secondary text-secondary-foreground border-transparent"
                        )}
                        style={{ 
                          top: `${top}%`, 
                          height: `${height}%`,
                          marginTop: '1px',
                        }}
                      >
                        <div className="font-semibold text-sm truncate">
                          {booking.user?.full_name ? booking.user.full_name : `User ID ${booking.user_id}`}
                        </div>
                        <div className="text-xs opacity-90 flex items-center gap-1 mt-1 truncate">
                          <Clock size={10} />
                          {new Date(booking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                          {new Date(booking.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking List Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Reservations */}
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle className="text-lg">My Active Reservations</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {loading ? (
              <div className="p-6 text-center text-muted">Loading...</div>
            ) : activeBookings.length === 0 ? (
              <div className="p-6 text-center text-muted border border-dashed border-border rounded-lg">
                No active bookings found.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {activeBookings.map(booking => (
                  <div key={booking.id} className="p-4 rounded-lg bg-background/50 border border-border flex justify-between items-center hover:border-primary/50 transition-colors">
                    <div>
                      <h4 className="font-semibold text-text">{booking.asset?.name || `Asset ID ${booking.asset_id}`}</h4>
                      <p className="text-xs text-muted mt-1">{formatTimeRange(booking.start_time, booking.end_time)}</p>
                      <span className={`inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded mt-2 ${
                        booking.status === 'ONGOING' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-secondary/20 text-secondary border border-secondary/30'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setRescheduleDate(booking.start_time.split('T')[0]);
                          setRescheduleStartTime(new Date(booking.start_time).toTimeString().substring(0, 5));
                          setRescheduleEndTime(new Date(booking.end_time).toTimeString().substring(0, 5));
                          setIsRescheduleModalOpen(true);
                          setFormError(null);
                        }}
                      >
                        Reschedule
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-error border-error/30 hover:bg-error/10 hover:text-error"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* History Reservations */}
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle className="text-lg">Past / Cancelled Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-6 text-center text-muted">Loading...</div>
            ) : pastBookings.length === 0 ? (
              <div className="p-6 text-center text-muted border border-dashed border-border rounded-lg">
                No past records.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm divide-y divide-border">
                  <thead>
                    <tr className="text-xs font-semibold uppercase tracking-wider text-muted">
                      <th className="pb-3">Asset</th>
                      <th className="pb-3">Time Range</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-text">
                    {pastBookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-background/10">
                        <td className="py-3 font-medium">{booking.asset?.name || `Asset ID ${booking.asset_id}`}</td>
                        <td className="py-3 text-xs text-muted">{formatTimeRange(booking.start_time, booking.end_time)}</td>
                        <td className="py-3 text-right">
                          <span className={`text-xs px-2 py-0.5 rounded border ${
                            booking.status === 'CANCELLED' ? 'bg-error/15 text-error border-error/30' : 'bg-muted/15 text-muted border-muted/30'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 1. Reserve Resource Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-surface border-border shadow-2xl animate-in fade-in zoom-in-95 duration-150 rounded-3xl">
            <CardHeader className="border-b border-border p-6 pb-4">
              <CardTitle className="text-xl">Reserve Resource Slot</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleCreateBooking} className="flex flex-col gap-4">
                {formError && (
                  <div className="p-3 text-sm text-error bg-error/10 border border-error/25 rounded-md">
                    {formError}
                  </div>
                )}
                
                {/* Select Shared Asset */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text mb-1">Select Resource Asset</label>
                  <select
                    value={bookAssetId}
                    onChange={(e) => setBookAssetId(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    required
                  >
                    <option value="">-- Choose Bookable Asset --</option>
                    {assets
                      .map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.serial_number}) {a.is_shared ? '[Shared]' : ''}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text mb-1">Reservation Date</label>
                  <input
                    type="date"
                    value={bookDate}
                    onChange={(e) => setBookDate(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-text mb-1">Start Time</label>
                    <input
                      type="time"
                      value={bookStartTime}
                      onChange={(e) => setBookStartTime(e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-text mb-1">End Time</label>
                    <input
                      type="time"
                      value={bookEndTime}
                      onChange={(e) => setBookEndTime(e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl h-11" onClick={() => setIsBookModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 rounded-xl h-11 bg-emerald-500 hover:bg-emerald-600 text-white border-none">
                    Confirm Reservation
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. Reschedule Booking Modal */}
      {isRescheduleModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-surface border-border shadow-2xl rounded-3xl animate-in fade-in zoom-in-95 duration-150">
            <CardHeader className="border-b border-border p-6 pb-4">
              <CardTitle className="text-xl">Reschedule Reservation</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleRescheduleBooking} className="flex flex-col gap-4">
                <p className="text-sm text-muted">
                  Rescheduling reservation for <strong>{selectedBooking.asset?.name || `Asset ID ${selectedBooking.asset_id}`}</strong>.
                </p>

                {formError && (
                  <div className="p-3 text-sm text-error bg-error/10 border border-error/25 rounded-md">
                    {formError}
                  </div>
                )}
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text mb-1">New Reservation Date</label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-text mb-1">New Start Time</label>
                    <input
                      type="time"
                      value={rescheduleStartTime}
                      onChange={(e) => setRescheduleStartTime(e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-text mb-1">New End Time</label>
                    <input
                      type="time"
                      value={rescheduleEndTime}
                      onChange={(e) => setRescheduleEndTime(e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl h-11" onClick={() => { setIsRescheduleModalOpen(false); setSelectedBooking(null); }}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 rounded-xl h-11 bg-emerald-500 hover:bg-emerald-600 text-white border-none">
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
