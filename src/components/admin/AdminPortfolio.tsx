import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Upload, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { supabase, PortfolioWork } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Image as ImageIcon } from 'lucide-react';

const categories = ['AI Music & Video', 'Graphic Design', 'Web Development'];

const emptyWork: Omit<PortfolioWork, 'id' | 'created_at' | 'updated_at'> = {
  title: '',
  description: '',
  image_url: '',
  project_url: '',
  category: 'Graphic Design',
  show_on_homepage: false,
};

export function AdminPortfolio() {
  const [works, setWorks] = useState<PortfolioWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<Partial<PortfolioWork> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_works')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorks(data || []);
    } catch (error) {
      console.error('Error fetching works:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingWork({ ...emptyWork });
    setDialogOpen(true);
  };

  const handleEdit = (work: PortfolioWork) => {
    setEditingWork({ ...work });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this work?')) return;

    setDeleting(id);
    try {
      const { error } = await supabase
        .from('portfolio_works')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWorks(works.filter((w) => w.id !== id));
      toast({ title: 'Work deleted successfully!' });
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `portfolio-${Date.now()}.${fileExt}`;
      const filePath = `portfolio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      setEditingWork((prev) => prev ? { ...prev, image_url: urlData.publicUrl } : null);
      toast({ title: 'Image uploaded successfully!' });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!editingWork?.title || !editingWork?.image_url) {
      toast({
        title: 'Validation error',
        description: 'Title and image are required.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (editingWork.id) {
        const { error } = await supabase
          .from('portfolio_works')
          .update({
            title: editingWork.title,
            description: editingWork.description,
            image_url: editingWork.image_url,
            project_url: editingWork.project_url,
            category: editingWork.category,
            show_on_homepage: editingWork.show_on_homepage ?? false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingWork.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('portfolio_works')
          .insert([{
            title: editingWork.title,
            description: editingWork.description,
            image_url: editingWork.image_url,
            project_url: editingWork.project_url,
            category: editingWork.category,
            show_on_homepage: editingWork.show_on_homepage ?? false,
          }]);

        if (error) throw error;
      }

      toast({ title: 'Work saved successfully!' });
      setDialogOpen(false);
      setEditingWork(null);
      fetchWorks();
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
          <h3 className="font-display text-xl font-semibold">Portfolio Works</h3>
          <p className="text-muted-foreground text-sm">
            Manage your portfolio items displayed on the website.
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Work
        </Button>
      </div>

      {works.length === 0 ? (
        <div className="text-center py-12 bg-secondary/30 rounded-2xl">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No portfolio works yet.</p>
          <Button onClick={handleAdd} variant="outline" className="mt-4">
            Add your first work
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {works.map((work) => (
              <motion.div
                key={work.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group bg-card rounded-xl overflow-hidden border border-border"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={work.image_url || ''}
                    alt={work.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(work)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(work.id)}
                      disabled={deleting === work.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-primary">{work.category}</span>
                    {(work as any).show_on_homepage && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Home className="w-3 h-3" /> Homepage
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold mt-1">{work.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {work.description}
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
              {editingWork?.id ? 'Edit Work' : 'Add New Work'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="Project title"
                value={editingWork?.title || ''}
                onChange={(e) =>
                  setEditingWork((prev) => prev ? { ...prev, title: e.target.value } : null)
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category *</label>
              <Select
                value={editingWork?.category || 'Graphic Design'}
                onValueChange={(value) =>
                  setEditingWork((prev) => prev ? { ...prev, category: value } : null)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Image *</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Image URL"
                  value={editingWork?.image_url || ''}
                  onChange={(e) =>
                    setEditingWork((prev) => prev ? { ...prev, image_url: e.target.value } : null)
                  }
                />
                <label className="cursor-pointer">
                  <Button type="button" variant="outline" size="icon" asChild>
                    <span>
                      <Upload className="w-4 h-4" />
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {editingWork?.image_url && (
                <img
                  src={editingWork.image_url}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Project URL (optional)</label>
              <Input
                placeholder="https://example.com/project"
                value={editingWork?.project_url || ''}
                onChange={(e) =>
                  setEditingWork((prev) => prev ? { ...prev, project_url: e.target.value } : null)
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Brief description of the project"
                rows={3}
                value={editingWork?.description || ''}
                onChange={(e) =>
                  setEditingWork((prev) => prev ? { ...prev, description: e.target.value } : null)
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Show on Homepage</label>
                <p className="text-xs text-muted-foreground">Enable to display this project on the homepage. Otherwise it will only appear on the Portfolio page.</p>
              </div>
              <Switch
                checked={(editingWork as any)?.show_on_homepage ?? false}
                onCheckedChange={(checked) =>
                  setEditingWork((prev) => prev ? { ...prev, show_on_homepage: checked } : null)
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
