import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, Quote, MessageSquarePlus } from 'lucide-react';
import md5 from 'md5';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AnimatedSection } from '@/components/animations/AnimatedSection';

interface Review {
  id: string;
  client_name: string;
  company_name: string | null;
  review_text: string;
  rating: number;
  created_at: string;
  is_approved: boolean;
  avatar_url: string | null;
}

const StarRating = ({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-5 h-5 transition-colors ${
          star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground'
        } ${interactive ? 'cursor-pointer hover:text-primary' : ''}`}
        onClick={() => interactive && onRate?.(star)}
      />
    ))}
  </div>
);

const ReviewForm = ({ onClose }: { onClose: () => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const submitMutation = useMutation({
    mutationFn: async () => {
      const hash = md5(email.trim().toLowerCase());
      const avatarUrl = `https://www.gravatar.com/avatar/${hash}?d=retro`;
      const { error } = await supabase.from('client_reviews').insert({
        client_name: name.trim(),
        review_text: message.trim(),
        rating,
        email: email.trim().toLowerCase(),
        avatar_url: avatarUrl,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Review submitted for approval!', description: 'Thank you for your feedback.' });
      onClose();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to submit review. Please try again.', variant: 'destructive' });
    },
  });

  const isValid = name.trim() && email.trim() && message.trim() && rating > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) submitMutation.mutate();
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={100} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email * <span className="text-xs text-muted-foreground">(private, never shown publicly)</span></Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" maxLength={255} required />
      </div>
      <div className="space-y-2">
        <Label>Rating *</Label>
        <StarRating rating={rating} onRate={setRating} interactive />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Review *</Label>
        <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Share your experience..." maxLength={1000} rows={4} required />
      </div>
      <Button type="submit" className="w-full" disabled={!isValid || submitMutation.isPending}>
        {submitMutation.isPending ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
};

export const TestimonialsSection = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['approved-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
  });

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Client <span className="gradient-text">Reviews</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              What my clients say about working with me
            </p>
          </div>
        </AnimatedSection>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 border border-border relative"
              >
                <Quote className="w-8 h-8 text-primary/30 absolute top-4 right-4" />
                <StarRating rating={review.rating} />
                <p className="text-muted-foreground mt-4 mb-6 text-sm leading-relaxed">
                  "{review.review_text}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={review.avatar_url || 'https://www.gravatar.com/avatar/?d=retro'}
                    alt={review.client_name}
                    className="w-10 h-10 rounded-full border border-border"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{review.client_name}</p>
                    {review.company_name && (
                      <p className="text-xs text-muted-foreground">{review.company_name}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground mb-12">No reviews yet. Be the first to share your experience!</p>
        )}

        <div className="text-center">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <MessageSquarePlus className="w-4 h-4" />
                Write a Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
              </DialogHeader>
              <ReviewForm onClose={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
};
