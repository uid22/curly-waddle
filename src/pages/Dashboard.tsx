import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Link2, LogOut, Plus, Trash2, Eye, Crown, Palette, Image as ImageIcon, BarChart3 } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Analytics } from "@/components/Analytics";

interface Profile {
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  background_video_url: string | null;
  background_audio_url: string | null;
  developer_badge: boolean;
  premium_badge: boolean;
  display_id: number | null;
  custom_badge_text: string | null;
  profile_layout: string;
}

interface Link {
  id: string;
  title: string;
  url: string;
  position: number;
  is_active: boolean;
}

interface SocialLink {
  id: string;
  platform: string;
  value: string;
  is_active: boolean;
  position: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { isPremium, loading: roleLoading } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [customBadgeText, setCustomBadgeText] = useState("");
  const [profileLayout, setProfileLayout] = useState("default");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newSocialPlatform, setNewSocialPlatform] = useState("");
  const [newSocialValue, setNewSocialValue] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    await loadProfile(session.user.id);
    await loadLinks(session.user.id);
    await loadSocialLinks(session.user.id);
    setLoading(false);
  };

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setDisplayName(data.display_name || "");
      setBio(data.bio || "");
      setCustomBadgeText(data.custom_badge_text || "");
      setProfileLayout(data.profile_layout || "default");
    }
  };

  const loadLinks = async (userId: string) => {
    const { data } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", userId)
      .order("position", { ascending: true });

    if (data) setLinks(data);
  };

  const loadSocialLinks = async (userId: string) => {
    const { data } = await supabase
      .from("social_links")
      .select("*")
      .eq("user_id", userId)
      .order("position", { ascending: true });

    if (data) setSocialLinks(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleUpdateProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        bio: bio,
        custom_badge_text: customBadgeText,
        profile_layout: profileLayout,
      })
      .eq("user_id", session.user.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated!");
      loadProfile(session.user.id);
    }
  };

  const handleAddLink = async () => {
    if (!newLinkTitle || !newLinkUrl) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("links")
      .insert({
        user_id: session.user.id,
        title: newLinkTitle,
        url: newLinkUrl,
        position: links.length,
      });

    if (error) {
      toast.error("Failed to add link");
    } else {
      toast.success("Link added!");
      setNewLinkTitle("");
      setNewLinkUrl("");
      loadLinks(session.user.id);
    }
  };

  const handleDeleteLink = async (id: string) => {
    const { error } = await supabase
      .from("links")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete link");
    } else {
      toast.success("Link deleted!");
      const { data: { session } } = await supabase.auth.getSession();
      if (session) loadLinks(session.user.id);
    }
  };

  const handleAddSocialLink = async () => {
    if (!newSocialPlatform || !newSocialValue) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("social_links")
      .insert({
        user_id: session.user.id,
        platform: newSocialPlatform,
        value: newSocialValue,
        position: socialLinks.length,
      });

    if (error) {
      toast.error("Failed to add social link");
    } else {
      toast.success("Social link added!");
      setNewSocialPlatform("");
      setNewSocialValue("");
      loadSocialLinks(session.user.id);
    }
  };

  const handleDeleteSocialLink = async (id: string) => {
    const { error } = await supabase
      .from("social_links")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete social link");
    } else {
      toast.success("Social link deleted!");
      const { data: { session } } = await supabase.auth.getSession();
      if (session) loadSocialLinks(session.user.id);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file);

    if (uploadError) {
      toast.error("Failed to upload avatar");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("user_id", session.user.id);

    if (updateError) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Avatar uploaded!");
      loadProfile(session.user.id);
    }

    setUploading(false);
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-t-2 border-b-2 border-primary rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero text-white">
      {/* Header */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-b border-white/10 backdrop-blur-md sticky top-0 z-50 bg-background/50"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow"
              >
                <Link2 className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold">Dashboard</h1>
                {profile && (
                  <p className="text-sm text-white/60">@{profile.username}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isPremium && (
                <Badge className="bg-gradient-primary border-0 shadow-glow">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/${profile?.username}`)}
                className="text-white hover:bg-white/10"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10 mb-6">
              <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Palette className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="links" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Link2 className="w-4 h-4 mr-2" />
                Links
              </TabsTrigger>
              <TabsTrigger value="social" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Social
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="bg-card/20 backdrop-blur-md border-white/10 shadow-elevated hover:shadow-glow transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Palette className="w-5 h-5 text-primary" />
                      Profile Settings
                    </CardTitle>
                    <CardDescription className="text-white/60">Customize your appearance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/90">Display Name</Label>
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your name"
                        className="bg-background/30 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/90">Bio</Label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        className="bg-background/30 border-white/20 text-white placeholder:text-white/40 min-h-[100px] resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/90">Avatar</Label>
                      <div className="flex items-center gap-3">
                        {profile?.avatar_url && (
                          <motion.img 
                            whileHover={{ scale: 1.1 }}
                            src={profile.avatar_url} 
                            alt="Avatar" 
                            className="w-12 h-12 rounded-full object-cover border-2 border-primary/50" 
                          />
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                          disabled={uploading}
                          className="border-white/20 text-white hover:bg-white/10 hover:border-primary/50 transition-all"
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'avatar')}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {isPremium && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-white/90 flex items-center gap-2">
                            Custom Badge
                            <Crown className="w-3 h-3 text-primary" />
                          </Label>
                          <Input
                            value={customBadgeText}
                            onChange={(e) => setCustomBadgeText(e.target.value)}
                            placeholder="Your custom badge"
                            className="bg-background/30 border-white/20 text-white placeholder:text-white/40"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white/90 flex items-center gap-2">
                            Layout
                            <Crown className="w-3 h-3 text-primary" />
                          </Label>
                          <Select value={profileLayout} onValueChange={setProfileLayout}>
                            <SelectTrigger className="bg-background/30 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Default</SelectItem>
                              <SelectItem value="minimal">Minimal</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    <Button
                      onClick={handleUpdateProfile}
                      className="w-full bg-gradient-primary hover:opacity-90 text-white shadow-glow transition-all duration-300"
                    >
                      Save Profile
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Links Tab */}
            <TabsContent value="links">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-card/20 backdrop-blur-md border-white/10 shadow-elevated hover:shadow-glow transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Link2 className="w-5 h-5 text-primary" />
                      Manage Links
                    </CardTitle>
                    <CardDescription className="text-white/60">Add and organize your custom links</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Input
                        value={newLinkTitle}
                        onChange={(e) => setNewLinkTitle(e.target.value)}
                        placeholder="Link title"
                        className="bg-background/30 border-white/20 text-white placeholder:text-white/40"
                      />
                      <Input
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="bg-background/30 border-white/20 text-white placeholder:text-white/40"
                      />
                      <Button
                        onClick={handleAddLink}
                        className="w-full bg-gradient-primary hover:opacity-90 text-white transition-all duration-300"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Link
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-[450px] overflow-y-auto">
                      {links.map((link, index) => (
                        <motion.div
                          key={link.id}
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center justify-between p-3 bg-background/20 rounded-lg border border-white/10 hover:border-primary/30 transition-all duration-300"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-white">{link.title}</p>
                            <p className="text-sm text-white/60 truncate">{link.url}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLink(link.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Social Links Tab */}
            <TabsContent value="social">
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-card/20 backdrop-blur-md border-white/10 shadow-elevated hover:shadow-glow transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-white">Social Links</CardTitle>
                    <CardDescription className="text-white/60">Connect your social media profiles</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Select value={newSocialPlatform} onValueChange={setNewSocialPlatform}>
                        <SelectTrigger className="bg-background/30 border-white/20 text-white">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="github">GitHub</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={newSocialValue}
                        onChange={(e) => setNewSocialValue(e.target.value)}
                        placeholder="Username or URL"
                        className="bg-background/30 border-white/20 text-white placeholder:text-white/40"
                      />
                      <Button
                        onClick={handleAddSocialLink}
                        className="w-full bg-gradient-primary hover:opacity-90 text-white transition-all duration-300"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Social
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-[450px] overflow-y-auto">
                      {socialLinks.map((social, index) => (
                        <motion.div
                          key={social.id}
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center justify-between p-3 bg-background/20 rounded-lg border border-white/10 hover:border-primary/30 transition-all duration-300"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium capitalize text-white">{social.platform}</p>
                            <p className="text-sm text-white/60 truncate">{social.value}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSocialLink(social.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <Analytics />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
