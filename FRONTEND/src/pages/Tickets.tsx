import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ticketService, Ticket, CreateTicketData } from "@/services/ticketService";
import {
  Plus,
  Ticket as TicketIcon,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  MoreHorizontal,
  Search,
  Filter
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { cn } from "@/lib/utils";

interface TicketData {
  title: string;
  category: string;
  description: string;
  priority?: string;
  department?: string;
}

const Tickets = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const form = useForm<TicketData>({
    defaultValues: { title: '', category: '', description: '', priority: 'medium', department: '' }
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getTicketsByRole(user?.role || 'student');
      setTickets(response.data.tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({ title: "Error", description: "Failed to load tickets.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: TicketData) => {
    try {
      setSubmitting(true);
      const ticketData: CreateTicketData = {
        title: data.title,
        description: data.description,
        category: data.category as any,
        priority: data.priority as any,
        department: data.department
      };
      await ticketService.createTicket(ticketData);
      toast({ title: "Success", description: "Ticket submitted successfully." });
      form.reset();
      setIsDialogOpen(false);
      fetchTickets();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create ticket.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "in_progress": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "resolved": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "closed": return "text-gray-500 bg-gray-500/10 border-gray-500/20";
      default: return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-500 bg-red-500/10";
      case "high": return "text-orange-500 bg-orange-500/10";
      case "medium": return "text-yellow-500 bg-yellow-500/10";
      case "low": return "text-green-500 bg-green-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  const filterTickets = (status: string) => {
    return tickets.filter(t =>
      t.status === status &&
      (t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const KanbanColumn = ({ title, status, icon: Icon }: { title: string, status: string, icon: any }) => (
    <div className="flex flex-col gap-4 min-w-[300px] flex-1">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-semibold flex items-center gap-2 text-muted-foreground">
          <Icon className="w-4 h-4" />
          {title}
          <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full text-foreground">{filterTickets(status).length}</span>
        </h3>
      </div>
      <div className="flex flex-col gap-3">
        {filterTickets(status).map((ticket) => (
          <div key={ticket._id} className="glass-card p-4 rounded-xl hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden">
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", getStatusColor(status).split(" ")[1].replace("/10", ""))}></div>
            <div className="flex justify-between items-start mb-2 pl-2">
              <span className="text-xs font-mono text-muted-foreground">#{ticket.ticketNumber}</span>
              <Badge variant="outline" className={cn("text-[10px] capitalize border-0", getPriorityColor(ticket.priority))}>
                {ticket.priority}
              </Badge>
            </div>
            <h4 className="font-medium text-sm mb-2 pl-2 group-hover:text-primary transition-colors line-clamp-2">{ticket.title}</h4>
            <div className="flex items-center justify-between mt-3 pl-2">
              <span className="text-xs text-muted-foreground capitalize bg-white/5 px-2 py-1 rounded-md">{ticket.category}</span>
              <span className="text-[10px] text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {filterTickets(status).length === 0 && (
          <div className="h-24 rounded-xl border-2 border-dashed border-white/5 flex items-center justify-center text-muted-foreground text-sm">
            No tickets
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Support Tickets</h1>
          <p className="text-muted-foreground">Track and manage your support requests.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search tickets..."
              className="pl-10 bg-white/5 border-white/10 focus:border-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 whitespace-nowrap">
                <Plus className="w-4 h-4 mr-2" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] glass-card border-primary/20">
              <DialogHeader>
                <DialogTitle>Submit New Ticket</DialogTitle>
                <DialogDescription>Describe your issue to get help.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="title"
                    rules={{ required: 'Required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl><Input placeholder="Brief summary" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      rules={{ required: 'Required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="technical">Technical</SelectItem>
                              <SelectItem value="academic">Academic</SelectItem>
                              <SelectItem value="administrative">Administrative</SelectItem>
                              <SelectItem value="financial">Financial</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    rules={{ required: 'Required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea placeholder="Detailed explanation..." className="min-h-[100px]" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={submitting}>{submitting ? <Loader2 className="animate-spin" /> : "Submit Ticket"}</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-6">
          <KanbanColumn title="Open" status="open" icon={AlertCircle} />
          <KanbanColumn title="In Progress" status="in_progress" icon={Clock} />
          <KanbanColumn title="Resolved" status="resolved" icon={CheckCircle} />
          <KanbanColumn title="Closed" status="closed" icon={XCircle} />
        </div>
      )}
    </DashboardLayout>
  );
};

export default Tickets;