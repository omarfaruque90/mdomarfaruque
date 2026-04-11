import { useState, useEffect, memo, useCallback } from 'react';
import { Users, Shield, ShieldOff, Ban, UserCheck, Plus, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
  is_banned: boolean;
  ban_reason: string | null;
}

const ROLES = ['admin', 'moderator', 'user'] as const;

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin':
      return 'default';
    case 'moderator':
      return 'secondary';
    default:
      return 'outline';
  }
};

function AdminUsersComponent() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [newBanDialogOpen, setNewBanDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('user');
  const [banReason, setBanReason] = useState('');
  const [banEmail, setBanEmail] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: 'Not authenticated', variant: 'destructive' });
        return;
      }

      const response = await supabase.functions.invoke('admin-users', {
        body: { action: 'list_users' },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setUsers(response.data.users || []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch users';
      console.error('Error fetching users:', error);
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleAddRole = async () => {
    if (!selectedUser || !selectedRole) return;
    
    setActionLoading(true);
    try {
      const response = await supabase.functions.invoke('admin-users', {
        body: { action: 'add_role', user_id: selectedUser.id, role: selectedRole },
      });

      if (response.error || response.data.error) {
        throw new Error(response.error?.message || response.data.error);
      }

      toast({ title: 'Role added successfully!' });
      setRoleDialogOpen(false);
      fetchUsers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add role';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    setActionLoading(true);
    try {
      const response = await supabase.functions.invoke('admin-users', {
        body: { action: 'remove_role', user_id: userId, role },
      });

      if (response.error || response.data.error) {
        throw new Error(response.error?.message || response.data.error);
      }

      toast({ title: 'Role removed successfully!' });
      fetchUsers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to remove role';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    try {
      const response = await supabase.functions.invoke('admin-users', {
        body: { action: 'ban_user', email: selectedUser.email, reason: banReason },
      });

      if (response.error || response.data.error) {
        throw new Error(response.error?.message || response.data.error);
      }

      toast({ title: 'User banned successfully!' });
      setBanDialogOpen(false);
      setBanReason('');
      fetchUsers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to ban user';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnbanUser = async (email: string) => {
    setActionLoading(true);
    try {
      const response = await supabase.functions.invoke('admin-users', {
        body: { action: 'unban_user', email },
      });

      if (response.error || response.data.error) {
        throw new Error(response.error?.message || response.data.error);
      }

      toast({ title: 'User unbanned successfully!' });
      fetchUsers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to unban user';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBanEmail = async () => {
    if (!banEmail) return;
    
    setActionLoading(true);
    try {
      const response = await supabase.functions.invoke('admin-users', {
        body: { action: 'ban_email', email: banEmail, reason: banReason },
      });

      if (response.error || response.data.error) {
        throw new Error(response.error?.message || response.data.error);
      }

      toast({ title: 'Email banned successfully!' });
      setNewBanDialogOpen(false);
      setBanEmail('');
      setBanReason('');
      fetchUsers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to ban email';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.roles.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-semibold">User Management</h3>
          <p className="text-muted-foreground text-sm">
            Manage user roles and access permissions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setNewBanDialogOpen(true)}>
            <Ban className="w-4 h-4 mr-2" />
            Ban Email
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by email or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.roles.includes('admin')).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Moderators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.roles.includes('moderator')).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Banned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {users.filter((u) => u.is_banned).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-secondary/30 rounded-2xl">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No users found.</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className={user.is_banned ? 'border-destructive/50 bg-destructive/5' : ''}>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{user.email}</span>
                      {user.is_banned && (
                        <Badge variant="destructive" className="text-xs">
                          BANNED
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span>Joined: {format(new Date(user.created_at), 'MMM d, yyyy')}</span>
                      {user.last_sign_in_at && (
                        <span>• Last login: {format(new Date(user.last_sign_in_at), 'MMM d, yyyy')}</span>
                      )}
                    </div>
                    {user.ban_reason && (
                      <p className="text-sm text-destructive mt-1">Reason: {user.ban_reason}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.roles.length === 0 ? (
                        <Badge variant="outline" className="text-muted-foreground">No roles</Badge>
                      ) : (
                        user.roles.map((role) => (
                          <Badge
                            key={role}
                            variant={getRoleBadgeVariant(role)}
                            className="cursor-pointer hover:opacity-80"
                            onClick={() => handleRemoveRole(user.id, role)}
                            title="Click to remove role"
                          >
                            {role}
                            <span className="ml-1">×</span>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(user);
                        setSelectedRole('user');
                        setRoleDialogOpen(true);
                      }}
                      disabled={actionLoading}
                    >
                      <Shield className="w-4 h-4 mr-1" />
                      Add Role
                    </Button>
                    {user.is_banned ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnbanUser(user.email)}
                        disabled={actionLoading}
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Unban
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedUser(user);
                          setBanDialogOpen(true);
                        }}
                        disabled={actionLoading}
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Ban
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Role to User</DialogTitle>
            <DialogDescription>
              Add a role to {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Select Role</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRole} disabled={actionLoading}>
              {actionLoading ? 'Adding...' : 'Add Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Ban {selectedUser?.email} from accessing the platform
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Reason (optional)</label>
            <Textarea
              placeholder="Enter ban reason..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBanUser} disabled={actionLoading}>
              {actionLoading ? 'Banning...' : 'Ban User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban New Email Dialog */}
      <Dialog open={newBanDialogOpen} onOpenChange={setNewBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban Email Address</DialogTitle>
            <DialogDescription>
              Prevent this email from signing up or logging in
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email Address</label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={banEmail}
                onChange={(e) => setBanEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Reason (optional)</label>
              <Textarea
                placeholder="Enter ban reason..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBanEmail} disabled={actionLoading || !banEmail}>
              {actionLoading ? 'Banning...' : 'Ban Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const AdminUsers = memo(AdminUsersComponent);
