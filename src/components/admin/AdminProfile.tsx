import { useState, useEffect } from 'react';
import { Camera, Save, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { supabase, Profile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export function AdminProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bio, setBio] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (data) {
        setProfile(data);
        setBio(data.bio || '');
        setImageUrl(data.image_url || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `profile-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      setImageUrl(urlData.publicUrl);
      toast({ title: 'Image uploaded successfully!' });
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (profile) {
        const { error } = await supabase
          .from('profiles')
          .update({ bio, image_url: imageUrl, updated_at: new Date().toISOString() })
          .eq('id', profile.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert([{ bio, image_url: imageUrl, user_id: user?.id || '' }]);

        if (error) throw error;
      }

      toast({ title: 'Profile saved successfully!' });
      fetchProfile();
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

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h3 className="font-display text-xl font-semibold mb-2">Profile Settings</h3>
        <p className="text-muted-foreground text-sm">
          Update your profile image and bio that appears on the website.
        </p>
      </div>

      {/* Profile Image */}
      <div className="space-y-4">
        <label className="text-sm font-medium">Profile Image</label>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-secondary border-2 border-dashed border-border">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
              <Camera className="w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Click the camera icon to upload a new image.</p>
            <p>Recommended: Square image, at least 400x400px.</p>
          </div>
        </div>
      </div>

      {/* Image URL (manual) */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Image URL (or paste a URL)</label>
        <Input
          placeholder="https://example.com/your-image.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Bio</label>
        <Textarea
          placeholder="Write a short bio about yourself..."
          rows={6}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          This bio will appear in the About section of your website.
        </p>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving} className="gap-2">
        <Save className="w-4 h-4" />
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}