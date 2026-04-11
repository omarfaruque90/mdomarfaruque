import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, BookOpen, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { supabase, Blog } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const emptyBlog: Omit<Blog, 'id' | 'created_at' | 'updated_at'> = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  cover_image_url: '',
  is_published: false,
  published_at: null,
};

export function AdminBlog() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Partial<Blog> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleAdd = () => {
    setEditingBlog({ ...emptyBlog });
    setDialogOpen(true);
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog({ ...blog });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    
    setDeleting(id);
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setBlogs(blogs.filter((b) => b.id !== id));
      toast({ title: 'Blog deleted successfully!' });
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
      const fileName = `blog-${Date.now()}.${fileExt}`;
      const filePath = `blogs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      setEditingBlog((prev) => prev ? { ...prev, cover_image_url: urlData.publicUrl } : null);
      toast({ title: 'Image uploaded successfully!' });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleTitleChange = (title: string) => {
    setEditingBlog((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        title,
        slug: prev.id ? prev.slug : generateSlug(title),
      };
    });
  };

  const handleSave = async () => {
    if (!editingBlog?.title || !editingBlog?.content || !editingBlog?.slug) {
      toast({
        title: 'Validation error',
        description: 'Title, slug, and content are required.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const publishedAt = editingBlog.is_published && !editingBlog.published_at 
        ? new Date().toISOString() 
        : editingBlog.published_at;

      if (editingBlog.id) {
        const { error } = await supabase
          .from('blogs')
          .update({
            title: editingBlog.title,
            slug: editingBlog.slug,
            content: editingBlog.content,
            excerpt: editingBlog.excerpt,
            cover_image_url: editingBlog.cover_image_url,
            is_published: editingBlog.is_published,
            published_at: publishedAt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingBlog.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blogs')
          .insert([{
            title: editingBlog.title,
            slug: editingBlog.slug,
            content: editingBlog.content,
            excerpt: editingBlog.excerpt,
            cover_image_url: editingBlog.cover_image_url,
            is_published: editingBlog.is_published,
            published_at: publishedAt,
          }]);

        if (error) throw error;
      }

      toast({ title: 'Blog saved successfully!' });
      setDialogOpen(false);
      setEditingBlog(null);
      fetchBlogs();
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
          <h3 className="font-display text-xl font-semibold">Blog Posts</h3>
          <p className="text-muted-foreground text-sm">
            Manage blog posts displayed on the website.
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Post
        </Button>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-12 bg-secondary/30 rounded-2xl">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No blog posts yet.</p>
          <Button onClick={handleAdd} variant="outline" className="mt-4">
            Write your first post
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {blogs.map((blog) => (
              <motion.div
                key={blog.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="p-4 rounded-xl border bg-card border-border"
              >
                <div className="flex items-start gap-4">
                  {blog.cover_image_url && (
                    <img
                      src={blog.cover_image_url}
                      alt={blog.title}
                      className="w-24 h-16 object-cover rounded-lg hidden sm:block"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {blog.is_published ? (
                        <Eye className="w-4 h-4 text-green-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                      <h4 className="font-semibold truncate">{blog.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                      {blog.excerpt || blog.content.substring(0, 100)}...
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {blog.is_published && blog.published_at
                        ? `Published: ${format(new Date(blog.published_at), 'MMM d, yyyy')}`
                        : 'Draft'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(blog)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(blog.id)}
                      disabled={deleting === blog.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBlog?.id ? 'Edit Blog Post' : 'Add New Blog Post'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="Blog post title"
                value={editingBlog?.title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Slug *</label>
              <Input
                placeholder="blog-post-slug"
                value={editingBlog?.slug || ''}
                onChange={(e) =>
                  setEditingBlog((prev) => prev ? { ...prev, slug: e.target.value } : null)
                }
              />
              <p className="text-xs text-muted-foreground">
                URL: /blog/{editingBlog?.slug || 'your-slug'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cover Image</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Image URL"
                  value={editingBlog?.cover_image_url || ''}
                  onChange={(e) =>
                    setEditingBlog((prev) => prev ? { ...prev, cover_image_url: e.target.value } : null)
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
              {editingBlog?.cover_image_url && (
                <img
                  src={editingBlog.cover_image_url}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Excerpt</label>
              <Textarea
                placeholder="Brief summary of the post (optional)"
                rows={2}
                value={editingBlog?.excerpt || ''}
                onChange={(e) =>
                  setEditingBlog((prev) => prev ? { ...prev, excerpt: e.target.value } : null)
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Content *</label>
              <Textarea
                placeholder="Write your blog post content here..."
                rows={12}
                value={editingBlog?.content || ''}
                onChange={(e) =>
                  setEditingBlog((prev) => prev ? { ...prev, content: e.target.value } : null)
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
              <div>
                <p className="font-medium">Publish</p>
                <p className="text-sm text-muted-foreground">
                  Make this post visible on the blog page
                </p>
              </div>
              <Switch
                checked={editingBlog?.is_published || false}
                onCheckedChange={(checked) =>
                  setEditingBlog((prev) => prev ? { ...prev, is_published: checked } : null)
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
