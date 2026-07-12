import React from 'react';
import { CalendarClock } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card, CardContent } from '../components/common/Card';

export const Bookings = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Resource Booking</h1>
          <p className="text-muted mt-1">Book shared resources and manage schedules.</p>
        </div>
        <Button className="gap-2">
          <CalendarClock size={18} />
          Book a Slot
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-surface border-border">
            <CardContent className="p-6">
              <h3 className="font-semibold text-text mb-4">Resource Selector</h3>
              <div className="p-4 bg-background border border-border rounded-md text-sm text-muted text-center min-h-[150px] flex items-center justify-center">
                Filters (Rooms, Vehicles, Projectors)
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-surface border-border">
            <CardContent className="p-6">
              <h3 className="font-semibold text-text mb-4">Date Selector</h3>
              <div className="p-4 bg-background border border-border rounded-md text-sm text-muted text-center min-h-[250px] flex items-center justify-center">
                Mini Calendar
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="bg-surface border-border min-h-[600px]">
            <CardContent className="p-6">
              <h3 className="font-semibold text-text mb-4">Booking Timeline</h3>
              <div className="p-4 bg-background border border-border rounded-md text-sm text-muted text-center h-[500px] flex items-center justify-center">
                Full calendar or timeline view will be implemented here.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
