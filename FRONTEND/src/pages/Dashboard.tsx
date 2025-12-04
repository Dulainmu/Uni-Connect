import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Bell,
  Calendar,
  MessageSquare,
  BookOpen,
  Clock,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";

const Dashboard = () => {
  const { user } = useAuth();
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
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{studentName}</span> 👋
          </h1>
          <p className="text-muted-foreground text-lg">Here's your daily campus overview.</p>
        </div>
        <div className="flex gap-3">
          <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Online
          </div>
          <div className="glass-panel px-4 py-2 rounded-full text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ animationDelay: '0.1s' }}>
            {quickAccess.map((item, index) => (
              <Link
                key={index}
                to={item.name === "Chat Centre" ? "/chat" : item.name === "Support Tickets" ? "/tickets" : "/appointments"}
                className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center gap-3 group hover:-translate-y-1 transition-transform"
              >
                <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-center">{item.name}</span>
                {item.count && (
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                    {item.count} New
                  </Badge>
                )}
              </Link>
            ))}
          </div>

          {/* Announcements */}
          <div style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Latest Updates
              </h2>
              <Link to="/announcements" className="text-sm text-primary hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="glass-card p-5 rounded-2xl group cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${announcement.type === 'urgent' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">{announcement.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-xs font-medium">{announcement.course}</span>
                          <span>•</span>
                          <span>{announcement.time}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Modules */}
          <div style={{ animationDelay: '0.3s' }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              My Modules
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((module) => (
                <div key={module.id} className="glass-card p-5 rounded-2xl hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-primary/20 text-primary">
                      {module.code}
                    </Badge>
                    <div className="p-2 bg-background/50 rounded-lg text-muted-foreground group-hover:text-primary transition-colors">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-1">{module.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{module.lecturer}</p>

                  <div className="flex items-center gap-2 text-xs font-medium bg-secondary/10 text-secondary w-fit px-3 py-1.5 rounded-lg">
                    <Clock className="w-3 h-3" />
                    Next: {module.nextClass}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Widgets */}
        <div className="space-y-8" style={{ animationDelay: '0.4s' }}>
          {/* Upcoming Appointments Widget */}
          <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full -mr-8 -mt-8"></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="font-bold text-lg">Upcoming</h3>
              <Link to="/appointments" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <Calendar className="w-5 h-5 text-primary" />
              </Link>
            </div>

            <div className="space-y-4 relative z-10">
              {upcomingAppointments.map((appointment, i) => (
                <div key={appointment.id} className="flex gap-4 items-start pb-4 border-b border-border/50 last:border-0 last:pb-0">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-muted-foreground uppercase">{appointment.time.split(',')[0]}</span>
                    <div className="w-0.5 h-full bg-border/50 my-1"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{appointment.subject}</h4>
                    <p className="text-xs text-muted-foreground mb-1">{appointment.lecturer}</p>
                    <Badge variant="secondary" className="text-[10px] h-5">{appointment.type}</Badge>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/appointments">
              <Button className="w-full mt-6 bg-primary/10 text-primary hover:bg-primary hover:text-white border-0">
                Book Appointment
              </Button>
            </Link>
          </div>

          {/* Messages Widget */}
          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Messages</h3>
              <Badge variant="destructive" className="rounded-full w-6 h-6 p-0 flex items-center justify-center">3</Badge>
            </div>

            <div className="space-y-4">
              {[1, 2].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                  <Avatar>
                    <AvatarFallback className="bg-secondary/20 text-secondary">JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Dr. John Doe</p>
                    <p className="text-xs text-muted-foreground truncate">Please check the attached file...</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">2m</span>
                </div>
              ))}
            </div>

            <Link to="/chat">
              <Button variant="outline" className="w-full mt-6 border-primary/20 hover:bg-primary/5 text-primary">
                Open Chat
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;