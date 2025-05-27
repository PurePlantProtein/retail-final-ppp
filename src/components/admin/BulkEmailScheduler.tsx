
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Clock } from 'lucide-react';

interface BulkEmailSchedulerProps {
  onScheduleChange: (enabled: boolean) => void;
}

export function BulkEmailScheduler({ onScheduleChange }: BulkEmailSchedulerProps) {
  const [isScheduled, setIsScheduled] = useState(false);
  const { toast } = useToast();

  const handleScheduleToggle = (enabled: boolean) => {
    setIsScheduled(enabled);
    onScheduleChange(enabled);
    
    if (enabled) {
      toast({
        title: "Auto-Schedule Enabled",
        description: "Bulk emails will be sent automatically every 30 days with the current configuration.",
      });
    } else {
      toast({
        title: "Auto-Schedule Disabled",
        description: "Automatic bulk emails have been turned off.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Auto-Schedule
        </CardTitle>
        <CardDescription>
          Automatically send bulk order emails every 30 days
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="auto-schedule">Enable 30-day recurring emails</Label>
            <p className="text-sm text-muted-foreground">
              Emails will be sent with the current product selection and message
            </p>
          </div>
          <Switch
            id="auto-schedule"
            checked={isScheduled}
            onCheckedChange={handleScheduleToggle}
          />
        </div>
        
        {isScheduled && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Next scheduled email: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
