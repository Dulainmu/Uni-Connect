import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Bell,
    Calendar,
    MessageSquare,
    Users,
    LogOut,
    Menu,
    X
} from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useToast } from "@/hooks/use-toast";

// NotificationBell component (Internal to Layout for now, or could be separate)
function NotificationBell() {
    const { notifications, unreadCount, markAllAsRead } = useNotifications();
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setOpen((v) => !v)} aria-label="Notifications">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1 min-w-[1.25rem] h-5 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </Button>
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in-up">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
                        <span className="font-semibold">Notifications</span>
                        <button className="text-xs text-primary hover:underline" onClick={() => { markAllAsRead(); setOpen(false); }}>Mark all as read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p>No new notifications</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div key={notif.id} className={`px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold uppercase tracking-wider text-primary">{notif.type}</span>
                                        <span className="text-[10px] text-muted-foreground ml-auto">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="text-sm leading-relaxed">{notif.message}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    const navItems = [
        { path: "/dashboard", label: "Dashboard", icon: "📊" },
        { path: "/chat", label: "Chat Centre", icon: <MessageSquare className="w-5 h-5" /> },
        { path: "/tickets", label: "Support Tickets", icon: <Users className="w-5 h-5" /> },
        { path: "/appointments", label: "Appointments", icon: <Calendar className="w-5 h-5" /> },
        { path: "/announcements", label: "Announcements", icon: <Bell className="w-5 h-5" /> },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 p-4">
                <div className="glass-panel h-full rounded-3xl flex flex-col p-6 relative overflow-hidden">
                    {/* Ambient Glow */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none"></div>

                    <div className="flex items-center gap-3 mb-10 relative z-10">
                        <Logo size={40} className="text-primary" />
                        <span className="text-2xl font-bold tracking-tight">UniConnect</span>
                    </div>

                    <nav className="space-y-2 flex-1 relative z-10">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-105 ${isActive(item.path)
                                        ? "bg-primary/10 text-primary font-medium shadow-sm ring-1 ring-primary/20"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${isActive(item.path) ? "bg-primary/20" : "bg-white/5"}`}>
                                    {typeof item.icon === 'string' ? <div className="w-5 h-5 flex items-center justify-center">{item.icon}</div> : item.icon}
                                </div>
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-auto relative z-10">
                        <div className="glass-card p-4 rounded-xl mb-4 flex items-center gap-3">
                            <Avatar className="w-10 h-10 border-2 border-primary/20">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-primary/20 text-primary">
                                    {user?.firstName?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user?.fullName || 'User'}</p>
                                <p className="text-xs text-muted-foreground truncate capitalize">{user?.role}</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-8 overflow-y-auto h-screen">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between mb-8 glass-panel p-4 rounded-2xl sticky top-4 z-50">
                    <div className="flex items-center gap-2">
                        <Logo size={32} />
                        <span className="text-xl font-bold">UniConnect</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <NotificationBell />
                        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 px-6 animate-fade-in-up">
                        <nav className="space-y-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg ${isActive(item.path)
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${isActive(item.path) ? "bg-primary/20" : "bg-white/5"}`}>
                                        {typeof item.icon === 'string' ? <div className="w-6 h-6 flex items-center justify-center">{item.icon}</div> : item.icon}
                                    </div>
                                    {item.label}
                                </Link>
                            ))}
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-8 px-4 py-4 h-auto text-lg"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                            >
                                <LogOut className="w-6 h-6 mr-4" />
                                Log Out
                            </Button>
                        </nav>
                    </div>
                )}

                <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
