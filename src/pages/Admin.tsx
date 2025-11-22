import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Crown, Shield, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  user_id: string;
}

interface UserRoleData {
  user_id: string;
  role: 'admin' | 'premium' | 'user';
}

interface AnalyticsStats {
  totalUsers: number;
  premiumUsers: number;
  adminUsers: number;
  totalClicks: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AnalyticsStats>({
    totalUsers: 0,
    premiumUsers: 0,
    adminUsers: 0,
    totalClicks: 0
  });

  useEffect(() => {
    if (roleLoading) return;
    if (!isAdmin) {
      toast.error("Access denied. Admin only.");
      navigate("/dashboard");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && isAdmin) {
      fetchData();
    }
  }, [roleLoading, isAdmin]);

  const fetchData = async () => {
    try {
      const [profilesRes, rolesRes, clicksRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('*'),
        supabase.from('link_clicks').select('id', { count: 'exact' })
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      const profiles = profilesRes.data || [];
      const roles = rolesRes.data || [];

      setProfiles(profiles);
      setUserRoles(roles);

      // Calculate stats
      setStats({
        totalUsers: profiles.length,
        premiumUsers: roles.filter(r => r.role === 'premium').length,
        adminUsers: roles.filter(r => r.role === 'admin').length,
        totalClicks: clicksRes.count || 0
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserRole = (userId: string) => {
    const role = userRoles.find(r => r.user_id === userId);
    return role?.role || 'user';
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'premium' | 'user') => {
    try {
      const existingRole = userRoles.find(r => r.user_id === userId);
      
      if (existingRole) {
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert([{ user_id: userId, role: newRole }]);
        
        if (error) throw error;
      }

      toast.success(`User role updated to ${newRole}`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <nav className="border-b border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-lg">i</span>
              </div>
              <span className="text-xl font-bold text-white">iayx.lol</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" className="text-white hover:text-primary hover:bg-white/10">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white">Admin Panel</h1>
            <p className="text-white/70">Manage users, roles, and view platform analytics</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-card/20 backdrop-blur-md border-white/10 shadow-elevated hover:shadow-glow transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/70">Total Users</p>
                      <p className="text-3xl font-bold text-white mt-1">{stats.totalUsers}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card/20 backdrop-blur-md border-white/10 shadow-elevated hover:shadow-glow transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/70">Premium Users</p>
                      <p className="text-3xl font-bold text-white mt-1">{stats.premiumUsers}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card/20 backdrop-blur-md border-white/10 shadow-elevated hover:shadow-glow transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/70">Admins</p>
                      <p className="text-3xl font-bold text-white mt-1">{stats.adminUsers}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-card/20 backdrop-blur-md border-white/10 shadow-elevated hover:shadow-glow transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/70">Total Clicks</p>
                      <p className="text-3xl font-bold text-white mt-1">{stats.totalClicks}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* User Management Table */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-card/20 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-white/70">
                  View and manage all registered users and their roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-white">Username</TableHead>
                        <TableHead className="text-white">Display Name</TableHead>
                        <TableHead className="text-white">Current Role</TableHead>
                        <TableHead className="text-white">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((profile) => {
                        const role = getUserRole(profile.user_id);
                        return (
                          <TableRow key={profile.id} className="border-white/10 hover:bg-white/5 transition-colors">
                            <TableCell className="text-white font-medium">{profile.username}</TableCell>
                            <TableCell className="text-white/80">{profile.display_name || '-'}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={role === 'admin' ? 'destructive' : role === 'premium' ? 'default' : 'secondary'}
                                className={`${role === 'premium' ? 'bg-primary' : ''} capitalize`}
                              >
                                {role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-primary text-primary hover:bg-primary hover:text-white transition-all"
                                  onClick={() => updateUserRole(profile.user_id, 'premium')}
                                  disabled={role === 'premium'}
                                >
                                  <Crown className="w-4 h-4 mr-1" />
                                  Premium
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-white/20 text-white hover:bg-white/10 transition-all"
                                  onClick={() => updateUserRole(profile.user_id, 'user')}
                                  disabled={role === 'user'}
                                >
                                  User
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                  onClick={() => updateUserRole(profile.user_id, 'admin')}
                                  disabled={role === 'admin'}
                                >
                                  <Shield className="w-4 h-4 mr-1" />
                                  Admin
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
