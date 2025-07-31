import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, 
  Calendar, 
  MessageSquare, 
  Users, 
  BookOpen, 
  Clock,
  ChevronRight,
  GraduationCap,
  Settings,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/contexts/NotificationContext";

// NotificationBell component
function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setOpen((v) => !v)} aria-label="Notifications">
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1">
            {unreadCount}
          </span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <span className="font-semibold">Notifications</span>
            <button className="text-xs text-primary underline" onClick={() => { markAllAsRead(); setOpen(false); }}>Mark all as read</button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No notifications</div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className={`px-4 py-2 border-b border-border last:border-b-0 ${!notif.read ? 'bg-accent/20' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium capitalize">{notif.type}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-sm mt-1">{notif.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast({
        title: "Success",
        description: "Logged out successfully!",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const studentName = user?.firstName || "User";

  const announcements = [
    {
      id: 1,
      title: "Tomorrow's COG deadline due 10:30am at 3 AM is cancelled",
      course: "Computational Thinking",
      time: "2 hours ago",
      type: "urgent"
    },
    {
      id: 2,
      title: "Final year project proposal submissions are due by June 25th",
      course: "General",
      time: "5 hours ago",
      type: "info"
    },
    {
      id: 3,
      title: "Assignments for academic advising are live now for booking",
      course: "Academic Support",
      time: "1 day ago",
      type: "info"
    }
  ];

  const upcomingAppointments = [
    {
      id: 1,
      lecturer: "Dr. Sarah Wilson",
      subject: "Machine Learning",
      time: "Today, 2:00 PM",
      type: "Office Hours"
    },
    {
      id: 2,
      lecturer: "Prof. Michael Chen",
      subject: "Database Systems",
      time: "Tomorrow, 10:00 AM",
      type: "Project Review"
    }
  ];

  const modules = [
    {
      id: 1,
      name: "Computational Thinking",
      code: "CS101",
      lecturer: "Dr. Smith",
      nextClass: "Mon, 9:00 AM"
    },
    {
      id: 2,
      name: "Web Development",
      code: "CS201",
      lecturer: "Prof. Johnson",
      nextClass: "Tue, 11:00 AM"
    }
  ];

  const quickAccess = [
    { name: "Chat Centre", icon: MessageSquare, count: 3 },
    { name: "Timetable Now", icon: Calendar, count: null },
    { name: "Event Calendar", icon: Calendar, count: null },
    { name: "Resources", icon: BookOpen, count: null }
  ];

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
              <Link to="/dashboard" className="text-primary font-medium">Dashboard</Link>
              <Link to="/chat" className="text-muted-foreground hover:text-foreground">Chat</Link>
              <Link to="/tickets" className="text-muted-foreground hover:text-foreground">Support</Link>
              <Link to="/appointments" className="text-muted-foreground hover:text-foreground">Appointments</Link>
              <Link to="/announcements" className="text-muted-foreground hover:text-foreground">Announcements</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span>{user?.role === 'student' ? 'Student' : user?.role === 'lecturer' ? 'Lecturer' : 'Admin'}</span>
              {user?.role === 'student' && user?.studentId && (
                <span>• {user.studentId}</span>
              )}
              {user?.role === 'lecturer' && user?.department && (
                <span>• {user.department}</span>
              )}
            </div>
            {/* Replace Bell icon with NotificationBell */}
            <NotificationBell />
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.firstName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user?.fullName || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                disabled={isLoggingOut}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {studentName}</h1>
            <p className="text-muted-foreground">Here's what's happening with your studies today.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Announcements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Announcements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1">{announcement.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{announcement.course}</span>
                            <span>•</span>
                            <span>{announcement.time}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Link to="/announcements">
                    <Button variant="outline" className="w-full mt-4">
                      View More
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* My Modules */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    My Modules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modules.map((module) => (
                      <div key={module.id} className="p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">{module.code}</Badge>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <h4 className="font-medium mb-1">{module.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{module.lecturer}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Next: {module.nextClass}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Unread Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Unread Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">AT</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Dr. Amelia Turner</p>
                        <p className="text-xs text-muted-foreground truncate">Latest message about...</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">2</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">JD</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Dr. John Davis</p>
                        <p className="text-xs text-muted-foreground truncate">Your assignment feedback...</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">1</Badge>
                    </div>
                  </div>
                  <Link to="/chat">
                    <Button variant="outline" className="w-full mt-4">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Open Chat Centre
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Upcoming Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="p-3 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">{appointment.type}</Badge>
                          <span className="text-xs text-muted-foreground">{appointment.time}</span>
                        </div>
                        <h4 className="font-medium text-sm mb-1">{appointment.lecturer}</h4>
                        <p className="text-xs text-muted-foreground">{appointment.subject}</p>
                      </div>
                    ))}
                  </div>
                  <Link to="/appointments">
                    <Button variant="outline" className="w-full mt-4">
                      Book New Appointment
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Quick Access */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/chat" className="p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors text-center group">
                      <MessageSquare className="w-6 h-6 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                      <p className="text-xs font-medium">Chat Centre</p>
                      <Badge variant="secondary" className="mt-1 text-xs">3</Badge>
                    </Link>
                    <Link to="/tickets" className="p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors text-center group">
                      <Users className="w-6 h-6 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                      <p className="text-xs font-medium">Support Tickets</p>
                    </Link>
                    <Link to="/appointments" className="p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors text-center group">
                      <Calendar className="w-6 h-6 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                      <p className="text-xs font-medium">Appointments</p>
                    </Link>
                    <Link to="#" className="p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors text-center group">
                      <BookOpen className="w-6 h-6 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                      <p className="text-xs font-medium">Resources</p>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;