import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, MousePointerClick, Eye, Globe } from "lucide-react";
import { motion } from "framer-motion";

interface AnalyticsData {
  totalClicks: number;
  totalLinks: number;
  clicksByDay: { date: string; clicks: number }[];
  clicksByLink: { title: string; clicks: number }[];
  recentClicks: { link_title: string; clicked_at: string; country: string }[];
}

const COLORS = ['hsl(270 70% 60%)', 'hsl(280 65% 65%)', 'hsl(290 60% 70%)', 'hsl(260 75% 55%)', 'hsl(250 65% 65%)'];

export const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalClicks: 0,
    totalLinks: 0,
    clicksByDay: [],
    clicksByLink: [],
    recentClicks: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get date range
      const now = new Date();
      const rangeDate = new Date();
      if (timeRange === '7d') rangeDate.setDate(now.getDate() - 7);
      else if (timeRange === '30d') rangeDate.setDate(now.getDate() - 30);
      else rangeDate.setFullYear(2000); // All time

      // Fetch user's links
      const { data: linksData } = await supabase
        .from('links')
        .select('id, title')
        .eq('user_id', user.id);

      const linkIds = linksData?.map(l => l.id) || [];

      // Fetch clicks
      const { data: clicksData } = await supabase
        .from('link_clicks')
        .select('*')
        .in('link_id', linkIds)
        .gte('clicked_at', rangeDate.toISOString())
        .order('clicked_at', { ascending: false });

      // Process analytics
      const totalClicks = clicksData?.length || 0;
      
      // Clicks by day
      const clicksByDay = processClicksByDay(clicksData || [], timeRange);
      
      // Clicks by link
      const clicksByLink = processClicksByLink(clicksData || [], linksData || []);
      
      // Recent clicks
      const recentClicks = (clicksData || []).slice(0, 10).map(click => {
        const link = linksData?.find(l => l.id === click.link_id);
        return {
          link_title: link?.title || 'Unknown',
          clicked_at: new Date(click.clicked_at).toLocaleDateString(),
          country: click.country || 'Unknown'
        };
      });

      setAnalytics({
        totalClicks,
        totalLinks: linksData?.length || 0,
        clicksByDay,
        clicksByLink,
        recentClicks
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processClicksByDay = (clicks: any[], range: string) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const dayMap: { [key: string]: number } = {};
    
    // Initialize all days with 0
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dayMap[dateStr] = 0;
    }
    
    // Count clicks
    clicks.forEach(click => {
      const dateStr = new Date(click.clicked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dayMap.hasOwnProperty(dateStr)) {
        dayMap[dateStr]++;
      }
    });
    
    return Object.entries(dayMap).map(([date, clicks]) => ({ date, clicks }));
  };

  const processClicksByLink = (clicks: any[], links: any[]) => {
    const linkMap: { [key: string]: number } = {};
    
    clicks.forEach(click => {
      const link = links.find(l => l.id === click.link_id);
      if (link) {
        linkMap[link.title] = (linkMap[link.title] || 0) + 1;
      }
    });
    
    return Object.entries(linkMap)
      .map(([title, clicks]) => ({ title, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/70">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['7d', '30d', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeRange === range
                ? 'bg-primary text-white shadow-glow'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'All Time'}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card/20 backdrop-blur-md border-white/10 shadow-elevated hover:shadow-glow transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Total Clicks</p>
                  <p className="text-3xl font-bold text-white mt-1">{analytics.totalClicks}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <MousePointerClick className="w-6 h-6 text-primary" />
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
                  <p className="text-sm text-white/70">Total Links</p>
                  <p className="text-3xl font-bold text-white mt-1">{analytics.totalLinks}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-accent" />
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
                  <p className="text-sm text-white/70">Avg. Clicks/Link</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {analytics.totalLinks > 0 ? Math.round(analytics.totalClicks / analytics.totalLinks) : 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
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
                  <p className="text-sm text-white/70">Total Views</p>
                  <p className="text-3xl font-bold text-white mt-1">{analytics.totalClicks}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Clicks Over Time */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-card/20 backdrop-blur-md border-white/10 shadow-elevated">
            <CardHeader>
              <CardTitle className="text-white">Clicks Over Time</CardTitle>
              <CardDescription className="text-white/70">Daily click trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.clicksByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Line type="monotone" dataKey="clicks" stroke="hsl(270 70% 60%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Links */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-card/20 backdrop-blur-md border-white/10 shadow-elevated">
            <CardHeader>
              <CardTitle className="text-white">Top Performing Links</CardTitle>
              <CardDescription className="text-white/70">Most clicked links</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.clicksByLink}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="title" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Bar dataKey="clicks" fill="hsl(270 70% 60%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Click Distribution */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-card/20 backdrop-blur-md border-white/10 shadow-elevated">
            <CardHeader>
              <CardTitle className="text-white">Click Distribution</CardTitle>
              <CardDescription className="text-white/70">By link performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.clicksByLink}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ title, percent }) => `${title}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="clicks"
                  >
                    {analytics.clicksByLink.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-card/20 backdrop-blur-md border-white/10 shadow-elevated">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
              <CardDescription className="text-white/70">Latest link clicks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {analytics.recentClicks.length === 0 ? (
                  <p className="text-white/50 text-center py-8">No clicks yet</p>
                ) : (
                  analytics.recentClicks.map((click, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                      <div>
                        <p className="text-white font-medium">{click.link_title}</p>
                        <p className="text-white/50 text-sm">{click.country}</p>
                      </div>
                      <p className="text-white/70 text-sm">{click.clicked_at}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
