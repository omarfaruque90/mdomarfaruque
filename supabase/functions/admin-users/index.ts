import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Create client with user's auth token to verify admin status
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      console.log('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin using the has_role function
    const { data: isAdmin, error: roleError } = await userClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      console.log('Role check failed:', roleError, 'isAdmin:', isAdmin);
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client for admin operations
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...params } = await req.json();
    console.log('Action:', action, 'Params:', params);

    switch (action) {
      case 'list_users': {
        // Get all users from auth.users
        const { data: authUsers, error: usersError } = await serviceClient.auth.admin.listUsers();
        
        if (usersError) {
          console.error('Error listing users:', usersError);
          throw usersError;
        }

        // Get all roles
        const { data: roles, error: rolesError } = await serviceClient
          .from('user_roles')
          .select('*');

        if (rolesError) {
          console.error('Error fetching roles:', rolesError);
          throw rolesError;
        }

        // Get banned users
        const { data: banned, error: bannedError } = await serviceClient
          .from('banned_users')
          .select('*');

        if (bannedError) {
          console.error('Error fetching banned users:', bannedError);
          throw bannedError;
        }

        // Map users with their roles and ban status
        const users = authUsers.users.map(u => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          roles: roles?.filter(r => r.user_id === u.id).map(r => r.role) || [],
          is_banned: banned?.some(b => b.email === u.email) || false,
          ban_reason: banned?.find(b => b.email === u.email)?.reason || null,
        }));

        console.log('Returning', users.length, 'users');
        return new Response(
          JSON.stringify({ users }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'add_role': {
        const { user_id, role } = params;
        
        // Check if role already exists
        const { data: existing } = await serviceClient
          .from('user_roles')
          .select('*')
          .eq('user_id', user_id)
          .eq('role', role)
          .maybeSingle();

        if (existing) {
          return new Response(
            JSON.stringify({ error: 'User already has this role' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await serviceClient
          .from('user_roles')
          .insert({ user_id, role });

        if (error) {
          console.error('Error adding role:', error);
          throw error;
        }

        console.log('Role added:', role, 'to user:', user_id);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'remove_role': {
        const { user_id, role } = params;
        
        const { error } = await serviceClient
          .from('user_roles')
          .delete()
          .eq('user_id', user_id)
          .eq('role', role);

        if (error) {
          console.error('Error removing role:', error);
          throw error;
        }

        console.log('Role removed:', role, 'from user:', user_id);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'ban_user': {
        const { email, reason } = params;
        
        const { error } = await serviceClient
          .from('banned_users')
          .insert({ email, reason, banned_by: user.id });

        if (error) {
          console.error('Error banning user:', error);
          throw error;
        }

        console.log('User banned:', email);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'unban_user': {
        const { email } = params;
        
        const { error } = await serviceClient
          .from('banned_users')
          .delete()
          .eq('email', email);

        if (error) {
          console.error('Error unbanning user:', error);
          throw error;
        }

        console.log('User unbanned:', email);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'ban_email': {
        // Ban an email even if user doesn't exist yet (prevent signup)
        const { email, reason } = params;
        
        const { error } = await serviceClient
          .from('banned_users')
          .insert({ email, reason, banned_by: user.id });

        if (error) {
          console.error('Error banning email:', error);
          throw error;
        }

        console.log('Email banned:', email);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'check_banned': {
        const { email } = params;
        
        const { data, error } = await serviceClient
          .from('banned_users')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (error) {
          console.error('Error checking ban:', error);
          throw error;
        }

        return new Response(
          JSON.stringify({ is_banned: !!data, reason: data?.reason }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});