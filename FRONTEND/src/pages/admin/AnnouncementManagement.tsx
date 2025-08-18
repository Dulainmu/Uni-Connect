import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Megaphone,
  Pin,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  category: string;
  priority: string;
  targetAudience: string[];
  isActive: boolean;
  isPinned: boolean;
  readCount: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
    priority: "medium",
    targetAudience: ["student", "lecturer"],
    isPinned: false,
    expiresAt: ""
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockAnnouncements: Announcement[] = [
        {
          _id: "1",
          title: "System Maintenance Scheduled",
          content: "The system will be under maintenance on Sunday from 2 AM to 6 AM. Please plan accordingly.",
          author: {
            _id: "admin1",
            firstName: "Admin",
            lastName: "User",
            email: "admin@uniconnect.com"
          },
          category: "maintenance",
          priority: "high",
          targetAudience: ["student", "lecturer", "admin"],
          isActive: true,
          isPinned: true,
          readCount: 245,
          expiresAt: "2024-02-15T00:00:00Z",
          createdAt: "2024-01-10T10:00:00Z",
          updatedAt: "2024-01-10T10:00:00Z"
        },
        {
          _id: "2",
          title: "New Feature: Enhanced Chat System",
          content: "We've upgraded our chat system with new features including file sharing and message reactions.",
          author: {
            _id: "admin1",
            firstName: "Admin",
            lastName: "User",
            email: "admin@uniconnect.com"
          },
          category: "general",
          priority: "medium",
          targetAudience: ["student", "lecturer"],
          isActive: true,
          isPinned: false,
          readCount: 156,
          createdAt: "2024-01-08T14:30:00Z",
          updatedAt: "2024-01-08T14:30:00Z"
        },
        {
          _id: "3",
          title: "Academic Calendar Update",
          content: "The final exam schedule has been updated. Please check your student portal for the latest information.",
          author: {
            _id: "admin1",
            firstName: "Admin",
            lastName: "User",
            email: "admin@uniconnect.com"
          },
          category: "academic",
          priority: "urgent",
          targetAudience: ["student"],
          isActive: true,
          isPinned: true,
          readCount: 89,
          expiresAt: "2024-01-25T00:00:00Z",
          createdAt: "2024-01-05T09:15:00Z",
          updatedAt: "2024-01-05T09:15:00Z"
        }
      ];
      setAnnouncements(mockAnnouncements);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      // Mock API call - replace with actual implementation
      const newAnnouncement: Announcement = {
        _id: Date.now().toString(),
        ...formData,
        author: {
          _id: "admin1",
          firstName: "Admin",
          lastName: "User",
          email: "admin@uniconnect.com"
        },
        isActive: true,
        readCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setAnnouncements([newAnnouncement, ...announcements]);
      toast({
        title: "Success",
        description: "Announcement created successfully",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create announcement",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAnnouncement = async () => {
    if (!selectedAnnouncement) return;
    
    try {
      // Mock API call - replace with actual implementation
      const updatedAnnouncements = announcements.map(ann => 
        ann._id === selectedAnnouncement._id 
          ? { ...ann, ...formData, updatedAt: new Date().toISOString() }
          : ann
      );
      
      setAnnouncements(updatedAnnouncements);
      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update announcement",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      // Mock API call - replace with actual implementation
      setAnnouncements(announcements.filter(ann => ann._id !== id));
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "general",
      priority: "medium",
      targetAudience: ["student", "lecturer"],
      isPinned: false,
      expiresAt: ""
    });
    setSelectedAnnouncement(null);
  };

  const openEditDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      priority: announcement.priority,
      targetAudience: announcement.targetAudience,
      isPinned: announcement.isPinned,
      expiresAt: announcement.expiresAt ? announcement.expiresAt.split('T')[0] : ""
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsViewDialogOpen(true);
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || announcement.category === categoryFilter;
    const matchesPriority = priorityFilter === "all" || announcement.priority === priorityFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && announcement.isActive) ||
      (statusFilter === "inactive" && !announcement.isActive) ||
      (statusFilter === "pinned" && announcement.isPinned);
    
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-muted';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return <Calendar className="w-4 h-4" />;
      case 'maintenance': return <AlertCircle className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'emergency': return <AlertCircle className="w-4 h-4" />;
      default: return <Megaphone className="w-4 h-4" />;
    }
  };

  const handleAudienceChange = (audience: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        targetAudience: [...formData.targetAudience, audience]
      });
    } else {
      setFormData({
        ...formData,
        targetAudience: formData.targetAudience.filter(a => a !== audience)
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Announcement Management</h1>
          <p className="text-muted-foreground">Create and manage platform announcements</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Announcement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{announcements.length}</p>
              </div>
              <Megaphone className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-foreground">{announcements.filter(a => a.isActive).length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pinned</p>
                <p className="text-2xl font-bold text-foreground">{announcements.filter(a => a.isPinned).length}</p>
              </div>
              <Pin className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reads</p>
                <p className="text-2xl font-bold text-foreground">{announcements.reduce((sum, a) => sum + a.readCount, 0)}</p>
              </div>
              <Eye className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 bg-input border-border text-foreground">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40 bg-input border-border text-foreground">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-input border-border text-foreground">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pinned">Pinned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Announcements Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">
            Announcements ({filteredAnnouncements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading announcements...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Title</TableHead>
                  <TableHead className="text-muted-foreground">Category</TableHead>
                  <TableHead className="text-muted-foreground">Priority</TableHead>
                  <TableHead className="text-muted-foreground">Audience</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Reads</TableHead>
                  <TableHead className="text-muted-foreground">Created</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnnouncements.map((announcement) => (
                  <TableRow key={announcement._id} className="border-border">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {announcement.isPinned && <Pin className="w-4 h-4 text-yellow-400" />}
                        <div>
                          <div className="font-medium text-foreground">{announcement.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {announcement.content}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(announcement.category)}
                        <span className="text-muted-foreground capitalize">{announcement.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getPriorityColor(announcement.priority)} text-foreground`}>
                        {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {announcement.targetAudience.map((audience) => (
                          <Badge key={audience} variant="outline" className="text-xs border-border text-muted-foreground">
                            {audience}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {announcement.isActive ? (
                          <Badge className="bg-primary text-foreground">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        {announcement.expiresAt && new Date(announcement.expiresAt) < new Date() && (
                          <Badge className="bg-red-600 text-foreground">Expired</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {announcement.readCount}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openViewDialog(announcement)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(announcement)}
                          className="text-muted-foreground hover:text-blue-400"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAnnouncement(announcement._id)}
                          className="text-muted-foreground hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Announcement Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new announcement for the platform
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="title" className="text-muted-foreground">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="bg-input border-border text-foreground"
                placeholder="Enter announcement title"
              />
            </div>
            <div>
              <Label htmlFor="content" className="text-muted-foreground">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="bg-input border-border text-foreground min-h-[100px]"
                placeholder="Enter announcement content"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-muted-foreground">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority" className="text-muted-foreground">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Target Audience</Label>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="student"
                    checked={formData.targetAudience.includes("student")}
                    onCheckedChange={(checked) => handleAudienceChange("student", checked as boolean)}
                  />
                  <Label htmlFor="student" className="text-muted-foreground">Students</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lecturer"
                    checked={formData.targetAudience.includes("lecturer")}
                    onCheckedChange={(checked) => handleAudienceChange("lecturer", checked as boolean)}
                  />
                  <Label htmlFor="lecturer" className="text-muted-foreground">Lecturers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="admin"
                    checked={formData.targetAudience.includes("admin")}
                    onCheckedChange={(checked) => handleAudienceChange("admin", checked as boolean)}
                  />
                  <Label htmlFor="admin" className="text-muted-foreground">Admins</Label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPinned"
                  checked={formData.isPinned}
                  onCheckedChange={(checked) => setFormData({...formData, isPinned: checked as boolean})}
                />
                <Label htmlFor="isPinned" className="text-muted-foreground">Pin Announcement</Label>
              </div>
              <div>
                <Label htmlFor="expiresAt" className="text-muted-foreground">Expires At (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAnnouncement} className="bg-primary hover:bg-primary/90">
              Create Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Announcement Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update announcement information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="editTitle" className="text-muted-foreground">Title</Label>
              <Input
                id="editTitle"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="editContent" className="text-muted-foreground">Content</Label>
              <Textarea
                id="editContent"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="bg-input border-border text-foreground min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editCategory" className="text-muted-foreground">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editPriority" className="text-muted-foreground">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Target Audience</Label>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="editStudent"
                    checked={formData.targetAudience.includes("student")}
                    onCheckedChange={(checked) => handleAudienceChange("student", checked as boolean)}
                  />
                  <Label htmlFor="editStudent" className="text-muted-foreground">Students</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="editLecturer"
                    checked={formData.targetAudience.includes("lecturer")}
                    onCheckedChange={(checked) => handleAudienceChange("lecturer", checked as boolean)}
                  />
                  <Label htmlFor="editLecturer" className="text-muted-foreground">Lecturers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="editAdmin"
                    checked={formData.targetAudience.includes("admin")}
                    onCheckedChange={(checked) => handleAudienceChange("admin", checked as boolean)}
                  />
                  <Label htmlFor="editAdmin" className="text-muted-foreground">Admins</Label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="editIsPinned"
                  checked={formData.isPinned}
                  onCheckedChange={(checked) => setFormData({...formData, isPinned: checked as boolean})}
                />
                <Label htmlFor="editIsPinned" className="text-muted-foreground">Pin Announcement</Label>
              </div>
              <div>
                <Label htmlFor="editExpiresAt" className="text-muted-foreground">Expires At (Optional)</Label>
                <Input
                  id="editExpiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAnnouncement} className="bg-blue-600 hover:bg-blue-700">
              Update Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Announcement Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-2xl">
          <DialogHeader>
            <DialogTitle>Announcement Details</DialogTitle>
          </DialogHeader>
          {selectedAnnouncement && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Title</Label>
                <p className="text-foreground font-medium">{selectedAnnouncement.title}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Content</Label>
                <p className="text-foreground">{selectedAnnouncement.content}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p className="text-foreground capitalize">{selectedAnnouncement.category}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <Badge className={`${getPriorityColor(selectedAnnouncement.priority)} text-foreground`}>
                    {selectedAnnouncement.priority.charAt(0).toUpperCase() + selectedAnnouncement.priority.slice(1)}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Target Audience</Label>
                <div className="flex gap-2 mt-1">
                  {selectedAnnouncement.targetAudience.map((audience) => (
                    <Badge key={audience} variant="outline" className="border-border text-muted-foreground">
                      {audience}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="flex gap-2 mt-1">
                    {selectedAnnouncement.isActive && (
                      <Badge className="bg-primary text-foreground">Active</Badge>
                    )}
                    {selectedAnnouncement.isPinned && (
                      <Badge className="bg-yellow-600 text-foreground">Pinned</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Read Count</Label>
                  <p className="text-foreground">{selectedAnnouncement.readCount}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Created At</Label>
                  <p className="text-foreground">{new Date(selectedAnnouncement.createdAt).toLocaleString()}</p>
                </div>
                {selectedAnnouncement.expiresAt && (
                  <div>
                    <Label className="text-muted-foreground">Expires At</Label>
                    <p className="text-foreground">{new Date(selectedAnnouncement.expiresAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">Author</Label>
                <p className="text-foreground">
                  {selectedAnnouncement.author.firstName} {selectedAnnouncement.author.lastName} ({selectedAnnouncement.author.email})
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnouncementManagement;