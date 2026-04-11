import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarCheck, Check, CheckCheck, Trash2, Clock, Mail, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

type MeetingRequest = {
  id: string;
  client_name: string;
  client_email: string;
  meeting_topic: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  created_at: string;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  confirmed: { label: 'Confirmed', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  completed: { label: 'Completed', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
};

export function AdminMeetings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['admin-meetings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_requests')
        .select('*')
        .order('preferred_date', { ascending: true });
      if (error) throw error;
      return data as MeetingRequest[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('meeting_requests')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-meetings'] });
      toast({ title: 'Status updated' });
    },
    onError: () => {
      toast({ title: 'Failed to update', variant: 'destructive' });
    },
  });

  const deleteMeeting = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('meeting_requests')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-meetings'] });
      toast({ title: 'Meeting request deleted' });
    },
    onError: () => {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Meeting Requests</h2>
        <Badge variant="outline" className="text-sm">
          {meetings.length} total
        </Badge>
      </div>

      {meetings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CalendarCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No meeting requests yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {meetings.map((m) => {
            const config = statusConfig[m.status] || statusConfig.pending;
            return (
              <Card key={m.id} className="overflow-hidden">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-display font-semibold text-lg">{m.meeting_topic}</h3>
                        <Badge variant="outline" className={config.className}>
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> {m.client_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" /> {m.client_email}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarCheck className="w-3.5 h-3.5" /> {format(new Date(m.preferred_date), 'PPP')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {m.preferred_time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Requested {format(new Date(m.created_at), 'PPP')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {m.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
                          onClick={() => updateStatus.mutate({ id: m.id, status: 'confirmed' })}
                        >
                          <Check className="w-4 h-4" /> Confirm
                        </Button>
                      )}
                      {m.status === 'confirmed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                          onClick={() => updateStatus.mutate({ id: m.id, status: 'completed' })}
                        >
                          <CheckCheck className="w-4 h-4" /> Mark Done
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => deleteMeeting.mutate(m.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
