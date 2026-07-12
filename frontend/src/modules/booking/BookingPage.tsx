import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import * as bookingService from '../../services/booking.service';
import * as allocationService from '../../services/allocation.service';

export const BookingPage: React.FC = () => {
  // Data States
  const [bookings, setBookings] = useState<bookingService.Booking[]>([]);
  const [assets, setAssets] = useState<allocationService.Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setBookings(bookingList);
      setAssets(assetList);
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
        <Button onClick={() => { setIsBookModalOpen(true); setFormError(null); }} className="w-full md:w-auto">
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

      {/* Calendar Style Time Grid Preview */}
      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle className="text-lg">Resource Booking Schedule</CardTitle>
          <p className="text-muted text-xs">Visualize active allocations and reserved slots below</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-12 text-center text-muted">Loading schedule...</div>
          ) : bookings.length === 0 ? (
            <div className="p-6 text-center text-muted bg-background/50 border border-dashed border-border rounded-lg">
              No reservations scheduled yet. Click 'Reserve Resource' to schedule a time slot.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="overflow-x-auto border border-border rounded-md">
                <div className="min-w-[800px] bg-background/30 grid grid-cols-6 divide-x divide-border border-b border-border text-center text-xs font-semibold p-2">
                  <div className="col-span-2 text-left pl-2">Resource Asset Name</div>
                  <div>Status</div>
                  <div>Reserved Slots Count</div>
                  <div className="col-span-2">Next Reservation Time</div>
                </div>
                {assets.map((asset) => {
                  const assetBookings = bookings.filter(b => b.asset_id === asset.id && b.status !== 'CANCELLED');
                  const nextBooking = assetBookings
                    .filter(b => new Date(b.start_time) > new Date())
                    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0];

                  return (
                    <div key={asset.id} className="min-w-[800px] grid grid-cols-6 divide-x divide-border border-b border-border/50 p-2 text-sm items-center hover:bg-background/20">
                      <div className="col-span-2 flex flex-col pl-2">
                        <span className="font-semibold">{asset.name}</span>
                        <span className="text-xs text-muted">{asset.serial_number}</span>
                      </div>
                      <div className="text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                          asset.status.toUpperCase() === 'AVAILABLE' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-secondary/10 text-secondary border border-secondary/20'
                        }`}>
                          {asset.status}
                        </span>
                      </div>
                      <div className="text-center font-bold">{assetBookings.length} active</div>
                      <div className="col-span-2 text-center text-xs text-muted">
                        {nextBooking ? formatTimeRange(nextBooking.start_time, nextBooking.end_time) : 'No upcoming bookings'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
          <Card className="w-full max-w-md bg-surface border-border shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <CardHeader>
              <CardTitle className="text-xl">Reserve Resource Slot</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateBooking} className="flex flex-col gap-4">
                {formError && (
                  <div className="p-3 text-sm text-error bg-error/10 border border-error/25 rounded-md">
                    {formError}
                  </div>
                )}
                
                {/* Select Shared Asset */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text">Select Resource Asset</label>
                  <select
                    value={bookAssetId}
                    onChange={(e) => setBookAssetId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
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

                {/* Date */}
                <Input
                  label="Select Reservation Date"
                  type="date"
                  value={bookDate}
                  onChange={(e) => setBookDate(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Start Time"
                    type="time"
                    value={bookStartTime}
                    onChange={(e) => setBookStartTime(e.target.value)}
                    required
                  />
                  <Input
                    label="End Time"
                    type="time"
                    value={bookEndTime}
                    onChange={(e) => setBookEndTime(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsBookModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
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
          <Card className="w-full max-w-md bg-surface border-border shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl">Reschedule Reservation</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRescheduleBooking} className="flex flex-col gap-4">
                <p className="text-sm text-muted">
                  Rescheduling reservation for <strong>{selectedBooking.asset?.name || `Asset ID ${selectedBooking.asset_id}`}</strong>.
                </p>

                {formError && (
                  <div className="p-3 text-sm text-error bg-error/10 border border-error/25 rounded-md">
                    {formError}
                  </div>
                )}
                
                {/* Date */}
                <Input
                  label="New Reservation Date"
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="New Start Time"
                    type="time"
                    value={rescheduleStartTime}
                    onChange={(e) => setRescheduleStartTime(e.target.value)}
                    required
                  />
                  <Input
                    label="New End Time"
                    type="time"
                    value={rescheduleEndTime}
                    onChange={(e) => setRescheduleEndTime(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsRescheduleModalOpen(false); setSelectedBooking(null); }}>
                    Cancel
                  </Button>
                  <Button type="submit">
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
