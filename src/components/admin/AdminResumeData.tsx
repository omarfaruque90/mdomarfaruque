import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase, ResumeData } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = ['Personal', 'Experience', 'Education', 'Skill'];

interface FormState {
  category: string;
  title: string;
  subtitle: string;
  description: string;
  display_order: number;
}

const emptyForm: FormState = {
  category: 'Personal',
  title: '',
  subtitle: '',
  description: '',
  display_order: 0,
};

export function AdminResumeData() {
  const [items, setItems] = useState<ResumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('resume_data')
      .select('*')
      .order('category')
      .order('display_order');

    if (error) {
      toast({ title: 'Error loading resume data', description: error.message, variant: 'destructive' });
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (item: ResumeData) => {
    setForm({
      category: item.category,
      title: item.title,
      subtitle: item.subtitle || '',
      description: item.description || '',
      display_order: item.display_order,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('resume_data').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Item deleted' });
      fetchItems();
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }

    const payload = {
      category: form.category,
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      description: form.description.trim() || null,
      display_order: form.display_order,
    };

    if (editingId) {
      const { error } = await supabase.from('resume_data').update(payload).eq('id', editingId);
      if (error) {
        toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Item updated' });
    } else {
      const { error } = await supabase.from('resume_data').insert([payload]);
      if (error) {
        toast({ title: 'Create failed', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Item created' });
    }

    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    fetchItems();
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold">Resume Data</h3>
          <p className="text-muted-foreground text-sm">Manage your digital resume content dynamically.</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-secondary/50 rounded-2xl p-6 space-y-4">
          <h4 className="font-semibold">{editingId ? 'Edit Item' : 'New Item'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Order</label>
              <Input
                type="number"
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="e.g., Phone, Frontend Developer, React"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Subtitle</label>
              <Input
                placeholder="e.g., Company Name, Date Range"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="e.g., Job details, bio, skill description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSubmit}>
              <Save className="w-4 h-4 mr-2" />
              {editingId ? 'Update' : 'Create'}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No resume data yet. Add your first item above.</p>
      ) : (
        CATEGORIES.map((cat) => {
          const catItems = items.filter((i) => i.category === cat);
          if (catItems.length === 0) return null;
          return (
            <div key={cat} className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">{cat}</h4>
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden md:table-cell">Subtitle</TableHead>
                      <TableHead className="w-24 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {catItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-muted-foreground">{item.display_order}</TableCell>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{item.subtitle || '—'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
