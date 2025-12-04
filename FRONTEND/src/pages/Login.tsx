import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("student");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, user } = useAuth();
  const { toast } = useToast();

  // Get the intended destination from location state
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  // Handle redirect after successful login/registration
  useEffect(() => {
    if (user && !isLoading) {
      console.log('User logged in:', user.role, 'Redirecting to:', user.role === 'admin' ? '/admin' : from);
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [user, isLoading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
      } else {
        const registerData = {
          firstName,
          lastName,
          email,
          password,
          role,
          ...(role === "student" && { studentId }),
          ...(role === "lecturer" && { department }),
        };
        await register(registerData);
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
      }
      // Navigation will be handled by useEffect when user state updates
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background overflow-hidden">
      {/* Left Side - Abstract Visuals */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center bg-black overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background"></div>

        <div className="relative z-10 p-12 text-white max-w-xl">
          <div className="mb-8 animate-fade-in-up">
            <Logo size={64} className="text-primary mb-6" />
            <h1 className="text-6xl font-bold mb-4 tracking-tight leading-tight">
              Welcome to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                UniConnect
              </span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Your all-in-one campus companion. Connect, collaborate, and manage your university life with style.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="glass-panel p-6 rounded-2xl">
              <div className="text-3xl mb-2">📅</div>
              <h3 className="font-semibold text-lg mb-1">Smart Scheduling</h3>
              <p className="text-sm text-gray-400">Book appointments effortlessly</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-semibold text-lg mb-1">Real-time Chat</h3>
              <p className="text-sm text-gray-400">Connect instantly with peers</p>
            </div>
          </div>
        </div>

        {/* Animated background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[128px] animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-[128px] animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Mobile Background Elements */}
        <div className="absolute inset-0 lg:hidden bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>

        <div className="w-full max-w-md relative z-10 animate-slide-in-right">
          <div className="lg:hidden flex justify-center mb-8">
            <Logo size={48} />
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-muted-foreground">
              {isLogin
                ? "Enter your credentials to access your account"
                : "Enter your details to get started"
              }
            </p>
          </div>

          <Card className="glass-card border-white/10 shadow-2xl">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="bg-white/5 border-white/10 focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="bg-white/5 border-white/10 focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 focus:border-primary/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 focus:border-primary/50 transition-colors"
                  />
                </div>

                {!isLogin && (
                  <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="space-y-3">
                      <Label>I am a...</Label>
                      <RadioGroup value={role} onValueChange={setRole} className="grid grid-cols-3 gap-4">
                        <div>
                          <RadioGroupItem value="student" id="student" className="peer sr-only" />
                          <Label
                            htmlFor="student"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                          >
                            <span className="text-xl mb-2">🎓</span>
                            Student
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="lecturer" id="lecturer" className="peer sr-only" />
                          <Label
                            htmlFor="lecturer"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                          >
                            <span className="text-xl mb-2">👨‍🏫</span>
                            Lecturer
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="admin" id="admin" className="peer sr-only" />
                          <Label
                            htmlFor="admin"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                          >
                            <span className="text-xl mb-2">🛡️</span>
                            Admin
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {role === "student" && (
                      <div className="space-y-2 animate-fade-in-up">
                        <Label htmlFor="studentId">Student ID</Label>
                        <Input
                          id="studentId"
                          type="text"
                          placeholder="STU-2024-001"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          required
                          className="bg-white/5 border-white/10 focus:border-primary/50 transition-colors"
                        />
                      </div>
                    )}

                    {role === "lecturer" && (
                      <div className="space-y-2 animate-fade-in-up">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          type="text"
                          placeholder="Computer Science"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          required
                          className="bg-white/5 border-white/10 focus:border-primary/50 transition-colors"
                        />
                      </div>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-medium bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {isLogin ? "Logging in..." : "Creating account..."}
                    </>
                  ) : (
                    isLogin ? "Sign In" : "Create Account"
                  )}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button type="button" variant="outline" className="w-full h-11 border-white/10 hover:bg-white/5">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Microsoft
                </Button>

                {isLogin && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label htmlFor="remember" className="text-sm cursor-pointer">Remember me</Label>
                    </div>
                    <a href="#" className="text-sm text-primary hover:text-secondary transition-colors">
                      Forgot password?
                    </a>
                  </div>
                )}
              </form>

              <div className="mt-8 text-center">
                <p className="text-muted-foreground text-sm">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-2 text-primary hover:text-secondary font-medium hover:underline transition-all"
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;