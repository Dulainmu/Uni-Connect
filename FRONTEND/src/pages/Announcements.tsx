import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell,
  Search,
  Filter,
  Clock,
  BookOpen,
  GraduationCap,
  AlertTriangle,
  Info,
  CheckCircle,
  Star,
  Plus,
  Loader2
} from "lucide-react";
import { announcementService, Announcement } from "@/services/announcementService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";

const Announcements = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const categories = ["all", "general", "academic", "event", "emergency", "maintenance"];
  const priorities = ["all", "low", "medium", "high", "urgent"];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching announcements...');
      console.log('User:', user);
      console.log('Auth token:', authService.getToken());
      
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (filterCategory !== "all") params.category = filterCategory;
      if (filterPriority !== "all") params.priority = filterPriority;
      
      console.log('Request params:', params);
      
      const response = await announcementService.getAnnouncements(params);
      console.log('API Response:', response);
      
      setAnnouncements(response.data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch announcements');
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (announcementId: string) => {
    try {
      await announcementService.markAsRead(announcementId);
      // Update the local state to reflect the read status
      setAnnouncements(prev => 
        prev.map(ann => 
          ann._id === announcementId 
            ? { ...ann, isReadByCurrentUser: true, readCount: ann.readCount + 1 }
            : ann
        )
      );
    } catch (err) {
      console.error('Error marking announcement as read:', err);
      toast({
        title: "Error",
        description: "Failed to mark announcement as read",
        variant: "destructive",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "academic":
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case "emergency":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "maintenance":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "event":
        return <Info className="w-4 h-4 text-green-500" />;
      case "general":
        return <Info className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
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
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || announcement.category === filterCategory;
    const matchesPriority = filterPriority === "all" || announcement.priority === filterPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const unreadCount = announcements.filter(a => !a.isReadByCurrentUser).length;
  const pinnedCount = announcements.filter(a => a.isPinned).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading announcements...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Announcements</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchAnnouncements}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">UniConnect</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 ml-8">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
              <Link to="/chat" className="text-muted-foreground hover:text-foreground">Chat</Link>
              <Link to="/tickets" className="text-muted-foreground hover:text-foreground">Support</Link>
              <Link to="/appointments" className="text-muted-foreground hover:text-foreground">Appointments</Link>
              <Link to="/announcements" className="text-primary font-medium">Announcements</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="w-4 h-4" />
            </Button>
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.firstName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Announcements</h1>
                <p className="text-muted-foreground">Stay updated with latest news and important information from the university.</p>
              </div>
              {(user?.role === 'lecturer' || user?.role === 'admin') && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Announcement
                </Button>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={fetchAnnouncements} variant="outline">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button onClick={fetchAnnouncements} variant="outline">
                  <Loader2 className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Announcements Tabs */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                All ({announcements.length})
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="pinned" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Pinned ({pinnedCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="space-y-4">
                {filteredAnnouncements.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No announcements found</h3>
                      <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredAnnouncements.map((announcement) => (
                    <Card 
                      key={announcement._id} 
                      className={`transition-colors hover:bg-secondary/30 cursor-pointer ${
                        !announcement.isReadByCurrentUser ? 'border-primary/50' : ''
                      }`}
                      onClick={() => handleMarkAsRead(announcement._id)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getCategoryIcon(announcement.category)}
                              <Badge variant={getPriorityBadgeVariant(announcement.priority)} className="text-xs">
                                {announcement.priority.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {announcement.category}
                              </Badge>
                              {!announcement.isReadByCurrentUser && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                              {announcement.isPinned && (
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{announcement.title}</h3>
                            <p className="text-muted-foreground mb-3 leading-relaxed">{announcement.content}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(announcement.createdAt)}
                              </span>
                              <span>By {announcement.author.firstName} {announcement.author.lastName}</span>
                              <span>{announcement.readCount} read{announcement.readCount !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="unread">
              <div className="space-y-4">
                {filteredAnnouncements.filter(a => !a.isReadByCurrentUser).length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No unread announcements</h3>
                      <p className="text-muted-foreground">You're all caught up!</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredAnnouncements.filter(a => !a.isReadByCurrentUser).map((announcement) => (
                    <Card 
                      key={announcement._id} 
                      className="transition-colors hover:bg-secondary/30 cursor-pointer border-primary/50"
                      onClick={() => handleMarkAsRead(announcement._id)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getCategoryIcon(announcement.category)}
                              <Badge variant={getPriorityBadgeVariant(announcement.priority)} className="text-xs">
                                {announcement.priority.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {announcement.category}
                              </Badge>
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              {announcement.isPinned && (
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{announcement.title}</h3>
                            <p className="text-muted-foreground mb-3 leading-relaxed">{announcement.content}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(announcement.createdAt)}
                              </span>
                              <span>By {announcement.author.firstName} {announcement.author.lastName}</span>
                              <span>{announcement.readCount} read{announcement.readCount !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="pinned">
              <div className="space-y-4">
                {filteredAnnouncements.filter(a => a.isPinned).length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No pinned announcements</h3>
                      <p className="text-muted-foreground">Important announcements will appear here when pinned.</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredAnnouncements.filter(a => a.isPinned).map((announcement) => (
                    <Card 
                      key={announcement._id} 
                      className={`transition-colors hover:bg-secondary/30 cursor-pointer ${
                        !announcement.isReadByCurrentUser ? 'border-primary/50' : ''
                      }`}
                      onClick={() => handleMarkAsRead(announcement._id)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getCategoryIcon(announcement.category)}
                              <Badge variant={getPriorityBadgeVariant(announcement.priority)} className="text-xs">
                                {announcement.priority.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {announcement.category}
                              </Badge>
                              {!announcement.isReadByCurrentUser && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{announcement.title}</h3>
                            <p className="text-muted-foreground mb-3 leading-relaxed">{announcement.content}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(announcement.createdAt)}
                              </span>
                              <span>By {announcement.author.firstName} {announcement.author.lastName}</span>
                              <span>{announcement.readCount} read{announcement.readCount !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Announcements;