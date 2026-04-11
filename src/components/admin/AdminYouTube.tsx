import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Youtube, ExternalLink, Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase, YouTubeVideo } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const emptyVideo: Omit<YouTubeVideo, 'id' | 'created_at' | 'updated_at'> = {
  title: '',
  caption: '',
  thumbnail_url: '',
  youtube_link: '',
};

export function AdminYouTube() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Partial<YouTubeVideo> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingVideo({ ...emptyVideo });
    setDialogOpen(true);
  };

  const handleEdit = (video: YouTubeVideo) => {
    setEditingVideo({ ...video });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    setDeleting(id);
    try {
      // Get the video to find the thumbnail URL
      const video = videos.find(v => v.id === id);
      
      const { error } = await supabase
        .from('youtube_videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Try to delete the thumbnail from storage if it's a Supabase URL
      if (video?.thumbnail_url?.includes('supabase')) {
        const path = video.thumbnail_url.split('/assets/')[1];
        if (path) {
          await supabase.storage.from('assets').remove([path]);
        }
      }
      
      setVideos(videos.filter((v) => v.id !== id));
      toast({ title: 'Video deleted successfully!' });
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `youtube-thumbnails/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('assets')
        .getPublicUrl(fileName);

      setEditingVideo((prev) => 
        prev ? { ...prev, thumbnail_url: urlData.publicUrl } : null
      );

      toast({ title: 'Thumbnail uploaded successfully!' });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!editingVideo?.title || !editingVideo?.thumbnail_url || !editingVideo?.youtube_link) {
      toast({
        title: 'Validation error',
        description: 'Title, thumbnail, and YouTube link are required.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (editingVideo.id) {
        const { error } = await supabase
          .from('youtube_videos')
          .update({
            title: editingVideo.title,
            caption: editingVideo.caption,
            thumbnail_url: editingVideo.thumbnail_url,
            youtube_link: editingVideo.youtube_link,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingVideo.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('youtube_videos')
          .insert([{
            title: editingVideo.title,
            caption: editingVideo.caption,
            thumbnail_url: editingVideo.thumbnail_url,
            youtube_link: editingVideo.youtube_link,
          }]);

        if (error) throw error;
      }

      toast({ title: 'Video saved successfully!' });
      setDialogOpen(false);
      setEditingVideo(null);
      fetchVideos();
    } catch (error: any) {
      toast({
        title: 'Save failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold">YouTube Videos</h3>
          <p className="text-muted-foreground text-sm">
            Manage YouTube videos displayed on the website.
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Video
        </Button>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-12 bg-secondary/30 rounded-2xl">
          <Youtube className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No YouTube videos yet.</p>
          <Button onClick={handleAdd} variant="outline" className="mt-4">
            Add your first video
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {videos.map((video) => (
              <motion.div
                key={video.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group bg-card rounded-xl overflow-hidden border border-border"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(video)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(video.id)}
                      disabled={deleting === video.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <a href={video.youtube_link} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold line-clamp-1">{video.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {video.caption}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingVideo?.id ? 'Edit Video' : 'Add New Video'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Thumbnail Image *</label>
              <div className="flex flex-col gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Thumbnail
                    </>
                  )}
                </Button>
                {editingVideo?.thumbnail_url ? (
                  <div className="relative">
                    <img
                      src={editingVideo.thumbnail_url}
                      alt="Thumbnail preview"
                      className="w-full h-40 object-cover rounded-lg border border-border"
                    />
                    <div className="absolute bottom-2 right-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-40 bg-secondary/50 rounded-lg border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground">
                    <Image className="w-8 h-8 mb-2" />
                    <p className="text-sm">No thumbnail uploaded</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">YouTube Link *</label>
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={editingVideo?.youtube_link || ''}
                onChange={(e) =>
                  setEditingVideo((prev) => prev ? { ...prev, youtube_link: e.target.value } : null)
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="Video title"
                value={editingVideo?.title || ''}
                onChange={(e) =>
                  setEditingVideo((prev) => prev ? { ...prev, title: e.target.value } : null)
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Caption / Description</label>
              <Textarea
                placeholder="Brief description of the video"
                rows={3}
                value={editingVideo?.caption || ''}
                onChange={(e) =>
                  setEditingVideo((prev) => prev ? { ...prev, caption: e.target.value } : null)
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || uploading}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}