import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Search,
  Clock,
  BookOpen,
  AlertTriangle,
  Info,
  CheckCircle,
  Star,
  Plus,
  Loader2,
  Filter
} from "lucide-react";
import { announcementService, Announcement } from "@/services/announcementService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import DashboardLayout from "@/components/DashboardLayout";
import { cn } from "@/lib/utils";

const Announcements = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createCategory, setCreateCategory] = useState("general");
  const [createPriority, setCreatePriority] = useState("low");
  const [createAudience, setCreateAudience] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const categories = ["all", "general", "academic", "event", "emergency", "maintenance"];
  const priorities = ["all", "low", "medium", "high", "urgent"];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (filterCategory !== "all") params.category = filterCategory;
      if (filterPriority !== "all") params.priority = filterPriority;
      const response = await announcementService.getAnnouncements(params);
      setAnnouncements(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch announcements');
      toast({ title: "Error", description: "Failed to load announcements", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (announcementId: string) => {
    try {
      await announcementService.markAsRead(announcementId);
      setAnnouncements(prev => prev.map(ann => ann._id === announcementId ? { ...ann, isReadByCurrentUser: true, readCount: ann.readCount + 1 } : ann));
    } catch (err) {
      toast({ title: "Error", description: "Failed to mark as read", variant: "destructive" });
    }
  };

  const handleCreateAnnouncement = async () => {
    setCreating(true);
    try {
      await announcementService.createAnnouncement({
        title: createTitle,
        content: createContent,
        category: createCategory as any,
        priority: createPriority as any,
        targetAudience: createAudience,
      });
      toast({ title: "Success", description: "Announcement created!" });
      setShowCreateModal(false);
      setCreateTitle(""); setCreateContent(""); setCreateCategory("general"); setCreatePriority("low"); setCreateAudience([]);
      fetchAnnouncements();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create announcement", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "academic": return <BookOpen className="w-4 h-4 text-blue-500" />;
      case "emergency": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "maintenance": return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "event": return <Info className="w-4 h-4 text-green-500" />;
      case "general": return <Info className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "urgent": case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) || announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || announcement.category === filterCategory;
    const matchesPriority = filterPriority === "all" || announcement.priority === filterPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const unreadCount = announcements.filter(a => !a.isReadByCurrentUser).length;
  const pinnedCount = announcements.filter(a => a.isPinned).length;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Announcements</h1>
          <p className="text-muted-foreground">Stay updated with the latest news.</p>
        </div>
        {(user?.role === 'lecturer' || user?.role === 'admin') && (
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                <Plus className="w-4 h-4 mr-2" />
                Create Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] glass-card border-primary/20">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input placeholder="Title" value={createTitle} onChange={e => setCreateTitle(e.target.value)} />
                <Textarea placeholder="Content" value={createContent} onChange={e => setCreateContent(e.target.value)} className="min-h-[100px]" />
                <div className="grid grid-cols-2 gap-4">
                  <Select value={createCategory} onValueChange={setCreateCategory}>
                    <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>{categories.filter(c => c !== "all").map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={createPriority} onValueChange={setCreatePriority}>
                    <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                    <SelectContent>{priorities.filter(p => p !== "all").map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="mb-2 text-sm font-medium">Target Audience</div>
                  <div className="flex gap-4">
                    {["student", "lecturer", "admin"].map(role => (
                      <label key={role} className="flex items-center gap-2 cursor-pointer text-sm">
                        <Checkbox checked={createAudience.includes(role)} onCheckedChange={checked => checked ? setCreateAudience(prev => [...prev, role]) : setCreateAudience(prev => prev.filter(r => r !== role))} />
                        <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button onClick={handleCreateAnnouncement} disabled={creating || !createTitle || !createContent}>{creating ? <Loader2 className="animate-spin" /> : "Create"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="glass-panel p-4 rounded-2xl mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search announcements..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-white/5 border-white/10" />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-white/10"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-white/10"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>{priorities.map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">All ({announcements.length})</TabsTrigger>
          <TabsTrigger value="unread" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="pinned" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Pinned ({pinnedCount})</TabsTrigger>
        </TabsList>

        {['all', 'unread', 'pinned'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {loading ? (
              <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center p-12 glass-panel rounded-2xl">
                <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No announcements found</h3>
                <p className="text-muted-foreground">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {(tab === 'all' ? filteredAnnouncements : tab === 'unread' ? filteredAnnouncements.filter(a => !a.isReadByCurrentUser) : filteredAnnouncements.filter(a => a.isPinned)).map((announcement) => (
                  <div
                    key={announcement._id}
                    className={cn(
                      "glass-card p-6 rounded-2xl transition-all duration-300 hover:border-primary/50 cursor-pointer group relative overflow-hidden",
                      !announcement.isReadByCurrentUser && "border-l-4 border-l-primary"
                    )}
                    onClick={() => handleMarkAsRead(announcement._id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          {getCategoryIcon(announcement.category)}
                          <Badge variant={getPriorityBadgeVariant(announcement.priority)} className="text-[10px] uppercase">{announcement.priority}</Badge>
                          <Badge variant="outline" className="text-[10px] uppercase bg-white/5">{announcement.category}</Badge>
                          {announcement.isPinned && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                          {!announcement.isReadByCurrentUser && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
                        </div>
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{announcement.title}</h3>
                        <p className="text-muted-foreground mb-4 leading-relaxed text-sm">{announcement.content}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(announcement.createdAt)}</span>
                          <span>By {announcement.author ? `${announcement.author.firstName} ${announcement.author.lastName}` : 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </DashboardLayout>
  );
};

export default Announcements;