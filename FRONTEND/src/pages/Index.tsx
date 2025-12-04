import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, BookOpen, Calendar } from "lucide-react";
import Logo from "@/components/Logo";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="border-b border-border/20 bg-card/10 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo size={32} />
              <span className="text-2xl font-bold text-foreground">UniConnect</span>
            </div>
            <Link to="/login">
              <Button variant="brand">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Connect, Learn, Excel
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            The ultimate platform for students and lecturers to connect, communicate, and collaborate. 
            Join thousands of students already using UniConnect to enhance their learning experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/login">
              <Button variant="brand" size="lg" className="w-full sm:w-auto">
                Start Learning Today
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Watch Demo
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/70 transition-all hover:scale-105">
              <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Real-time Chat</h3>
              <p className="text-sm text-muted-foreground">
                Instant messaging with lecturers and classmates for seamless communication
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/70 transition-all hover:scale-105">
              <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Smart Scheduling</h3>
              <p className="text-sm text-muted-foreground">
                Book appointments and manage your academic calendar effortlessly
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/70 transition-all hover:scale-105">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">
                Join study groups and connect with peers in your field of study
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/70 transition-all hover:scale-105">
              <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Resources</h3>
              <p className="text-sm text-muted-foreground">
                Access course materials, assignments, and learning resources
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 bg-card/5 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Logo size={24} />
              <span className="text-lg font-bold">UniConnect</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 UniConnect. Empowering education through technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
