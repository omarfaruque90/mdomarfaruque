import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Check, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  client_name: string;
  company_name: string | null;
  review_text: string;
  rating: number;
  created_at: string;
  is_approved: boolean;
  email: string | null;
  avatar_url: string | null;
}

export const AdminReviews = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('client_reviews').update({ is_approved: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({ title: 'Review approved!' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('client_reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({ title: 'Review deleted.' });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-display">Client Reviews</h2>
        <Badge variant="secondary">{reviews.length} total</Badge>
      </div>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-start gap-4">
              <img
                src={review.avatar_url || 'https://www.gravatar.com/avatar/?d=retro'}
                alt={review.client_name}
                className="w-12 h-12 rounded-full border border-border shrink-0"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-semibold">{review.client_name}</span>
                  {review.email && (
                    <span className="text-sm text-muted-foreground">({review.email})</span>
                  )}
                  <Badge variant={review.is_approved ? 'default' : 'secondary'}>
                    {review.is_approved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{review.review_text}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {!review.is_approved && (
                  <Button size="sm" onClick={() => approveMutation.mutate(review.id)} disabled={approveMutation.isPending}>
                    <Check className="w-4 h-4 mr-1" /> Approve
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(review.id)} disabled={deleteMutation.isPending}>
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
