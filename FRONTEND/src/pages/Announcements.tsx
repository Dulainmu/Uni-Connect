import { useState } from "react";
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
  Star
} from "lucide-react";

const Announcements = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const announcements = [
    {
      id: 1,
      title: "Project Research Paper Instructions and Instruction for 16th Jan Assignment",
      content: "All students are required to submit their research project papers by the assigned deadline. The papers should be original work with proper citations. Guidelines have been posted in the course portal.",
      course: "Computational Thinking",
      author: "Dr. Sarah Wilson",
      type: "academic",
      priority: "high",
      timestamp: "2 hours ago",
      isRead: false,
      isStarred: true
    },
    {
      id: 2,
      title: "2nd Year OOP Part 3 (Module 3) Results",
      content: "The results for Object-Oriented Programming Module 3 have been published. Students can view their grades in the student portal. Consultations are available for those who need clarification.",
      course: "Computer Science",
      author: "Prof. Michael Chen",
      type: "academic",
      priority: "medium",
      timestamp: "5 hours ago",
      isRead: true,
      isStarred: false
    },
    {
      id: 3,
      title: "Network Infrastructure Scheduled Maintenance",
      content: "The university network will undergo scheduled maintenance on Saturday from 2 AM to 6 AM. During this time, online services may be temporarily unavailable.",
      course: "General",
      author: "IT Department",
      type: "system",
      priority: "medium",
      timestamp: "1 day ago",
      isRead: false,
      isStarred: false
    },
    {
      id: 4,
      title: "Student Handbook Updates",
      content: "The student handbook has been updated with new policies regarding academic integrity and campus facilities. All students are encouraged to review the changes.",
      course: "General",
      author: "Academic Administration",
      type: "administrative",
      priority: "low",
      timestamp: "2 days ago",
      isRead: true,
      isStarred: true
    }
  ];

  const courses = ["All Courses", "Computational Thinking", "Computer Science", "General"];
  const types = ["All Types", "Academic", "System", "Administrative"];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "academic":
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case "system":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "administrative":
        return <Info className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
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

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === "all" || announcement.course.toLowerCase().includes(filterCourse);
    const matchesType = filterType === "all" || announcement.type === filterType;
    
    return matchesSearch && matchesCourse && matchesType;
  });

  const unreadCount = announcements.filter(a => !a.isRead).length;
  const starredCount = announcements.filter(a => a.isStarred).length;

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
              <AvatarFallback className="bg-primary text-primary-foreground">C</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Announcements</h1>
            <p className="text-muted-foreground">Stay updated with latest news and important information from the university.</p>
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
                <Select value={filterCourse} onValueChange={setFilterCourse}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course} value={course.toLowerCase().replace(" ", "-")}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase().replace(" ", "-")}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <TabsTrigger value="starred" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Starred ({starredCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="space-y-4">
                {filteredAnnouncements.map((announcement) => (
                  <Card key={announcement.id} className={`transition-colors hover:bg-secondary/30 ${!announcement.isRead ? 'border-primary/50' : ''}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(announcement.type)}
                            <Badge variant={getPriorityBadgeVariant(announcement.priority)} className="text-xs">
                              {announcement.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {announcement.course}
                            </Badge>
                            {!announcement.isRead && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                            {announcement.isStarred && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{announcement.title}</h3>
                          <p className="text-muted-foreground mb-3 leading-relaxed">{announcement.content}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {announcement.timestamp}
                            </span>
                            <span>By {announcement.author}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="unread">
              <div className="space-y-4">
                {filteredAnnouncements.filter(a => !a.isRead).map((announcement) => (
                  <Card key={announcement.id} className="transition-colors hover:bg-secondary/30 border-primary/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(announcement.type)}
                            <Badge variant={getPriorityBadgeVariant(announcement.priority)} className="text-xs">
                              {announcement.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {announcement.course}
                            </Badge>
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            {announcement.isStarred && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{announcement.title}</h3>
                          <p className="text-muted-foreground mb-3 leading-relaxed">{announcement.content}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {announcement.timestamp}
                            </span>
                            <span>By {announcement.author}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="starred">
              <div className="space-y-4">
                {filteredAnnouncements.filter(a => a.isStarred).map((announcement) => (
                  <Card key={announcement.id} className={`transition-colors hover:bg-secondary/30 ${!announcement.isRead ? 'border-primary/50' : ''}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(announcement.type)}
                            <Badge variant={getPriorityBadgeVariant(announcement.priority)} className="text-xs">
                              {announcement.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {announcement.course}
                            </Badge>
                            {!announcement.isRead && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{announcement.title}</h3>
                          <p className="text-muted-foreground mb-3 leading-relaxed">{announcement.content}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {announcement.timestamp}
                            </span>
                            <span>By {announcement.author}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Announcements;