import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase, Resume } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export function AdminResume() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setResume(data);
        setFileUrl(data.url);
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const fileName = `resume-${Date.now()}.pdf`;
      const filePath = `resumes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      const newUrl = urlData.publicUrl;

      // Save to database
      if (resume) {
        const { error } = await supabase
          .from('resumes')
          .update({ url: newUrl })
          .eq('id', resume.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('resumes')
          .insert([{ url: newUrl }]);

        if (error) throw error;
      }

      setFileUrl(newUrl);
      toast({ title: 'Resume uploaded successfully!' });
      fetchResume();
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSave = async () => {
    if (!fileUrl) return;

    try {
      if (resume) {
        const { error } = await supabase
          .from('resumes')
          .update({ url: fileUrl })
          .eq('id', resume.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('resumes')
          .insert([{ url: fileUrl }]);

        if (error) throw error;
      }

      toast({ title: 'Resume URL saved!' });
      fetchResume();
    } catch (error: any) {
      toast({
        title: 'Save failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h3 className="font-display text-xl font-semibold mb-2">Resume Management</h3>
        <p className="text-muted-foreground text-sm">
          Upload or update your resume PDF file.
        </p>
      </div>

      {/* Current Resume Preview */}
      {fileUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary/50 rounded-2xl p-6 flex items-center gap-4"
        >
          <div className="w-16 h-20 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Current Resume</p>
            <p className="text-sm text-muted-foreground truncate max-w-xs">
              {fileUrl}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(fileUrl, '_blank')}
            >
              <Download className="w-4 h-4 mr-1" />
              View
            </Button>
          </div>
        </motion.div>
      )}

      {/* Upload Section */}
      <div className="space-y-4">
        <label className="text-sm font-medium">Upload New Resume (PDF)</label>
        <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="resume-upload"
            disabled={uploading}
          />
          <label htmlFor="resume-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium">
              {uploading ? 'Uploading...' : 'Click to upload PDF'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or drag and drop
            </p>
          </label>
        </div>
      </div>

      {/* URL Input */}
      <div className="space-y-4">
        <label className="text-sm font-medium">Or enter a direct URL</label>
        <div className="flex gap-2">
          <Input
            placeholder="https://example.com/resume.pdf"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
          />
          <Button onClick={handleUrlSave} variant="outline">
            Save URL
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          You can also paste a direct link to your resume hosted elsewhere.
        </p>
      </div>
    </div>
  );
}