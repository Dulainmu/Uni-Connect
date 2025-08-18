import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Filter, 
  Eye,
  UserCheck,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ticketService, Ticket, Lecturer } from "@/services/ticketService";

const TicketManagement = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [assignedLecturerId, setAssignedLecturerId] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
    fetchLecturers();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getTicketsByRole('admin');
      if (response.success) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLecturers = async () => {
    try {
      const response = await ticketService.getAvailableLecturers();
      if (response.success) {
        setLecturers(response.data.lecturers);
      }
    } catch (error) {
      console.error("Failed to fetch lecturers:", error);
    }
  };

  const handleAssignTicket = async () => {
    if (!selectedTicket || !assignedLecturerId) return;

    try {
      const response = await ticketService.updateTicket(selectedTicket._id, {
        assignedTo: assignedLecturerId
      });
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Ticket assigned successfully",
        });
        setIsAssignDialogOpen(false);
        setSelectedTicket(null);
        setAssignedLecturerId("");
        fetchTickets();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign ticket",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      const response = await ticketService.updateTicket(ticketId, { status: status as any });
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Ticket status updated successfully",
        });
        fetchTickets();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update ticket status",
        variant: "destructive",
      });
    }
  };

  const openAssignDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setAssignedLecturerId(ticket.assignedTo?._id || "");
    setIsAssignDialogOpen(true);
  };

  const openViewDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsViewDialogOpen(true);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.submittedBy.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.submittedBy.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <AlertCircle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ticket Management</h1>
          <p className="text-muted-foreground">Manage and assign support tickets</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-500 text-foreground">
            Total: {tickets.length}
          </Badge>
          <Badge className="bg-yellow-500 text-foreground">
            Open: {tickets.filter(t => t.status === 'open').length}
          </Badge>
          <Badge className="bg-red-500 text-foreground">
            Unassigned: {tickets.filter(t => !t.assignedTo).length}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tickets by title, description, or ticket number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-input border-border text-foreground">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 bg-input border-border text-foreground">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="administrative">Administrative</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">
            Tickets ({filteredTickets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading tickets...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Ticket</TableHead>
                  <TableHead className="text-muted-foreground">Student</TableHead>
                  <TableHead className="text-muted-foreground">Priority</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Assigned To</TableHead>
                  <TableHead className="text-muted-foreground">Created</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket._id} className="border-border">
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{ticket.title}</div>
                        <div className="text-sm text-muted-foreground">#{ticket.ticketNumber}</div>
                        <div className="text-xs text-muted-foreground capitalize">{ticket.category}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-muted text-foreground text-xs">
                            {ticket.submittedBy.firstName.charAt(0)}{ticket.submittedBy.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm text-foreground">
                            {ticket.submittedBy.firstName} {ticket.submittedBy.lastName}
                          </div>
                          {ticket.submittedBy.studentId && (
                            <div className="text-xs text-muted-foreground">ID: {ticket.submittedBy.studentId}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getPriorityColor(ticket.priority)} text-foreground`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(ticket.status)}
                        <Badge className={`${getStatusColor(ticket.status)} text-foreground`}>
                          {ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.replace('_', ' ').slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {ticket.assignedTo ? (
                        <div className="text-sm text-foreground">
                          {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground border-border">
                          Unassigned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openViewDialog(ticket)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAssignDialog(ticket)}
                          className="text-muted-foreground hover:text-blue-400"
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                        {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                          <Select onValueChange={(value) => handleUpdateStatus(ticket._id, value)}>
                            <SelectTrigger className="w-24 h-8 bg-input border-border text-foreground text-xs">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assign Ticket Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Assign Ticket</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Assign this ticket to a lecturer
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground">{selectedTicket.title}</h4>
                <p className="text-sm text-muted-foreground">#{selectedTicket.ticketNumber}</p>
              </div>
              <div>
                <Label htmlFor="lecturer" className="text-muted-foreground">Select Lecturer</Label>
                <Select value={assignedLecturerId} onValueChange={setAssignedLecturerId}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Choose a lecturer" />
                  </SelectTrigger>
                  <SelectContent>
                    {lecturers.map((lecturer) => (
                      <SelectItem key={lecturer._id} value={lecturer._id}>
                        {lecturer.firstName} {lecturer.lastName} - {lecturer.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignTicket} className="bg-blue-600 hover:bg-blue-700">
              Assign Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Ticket Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Ticket Number</Label>
                  <p className="text-foreground">#{selectedTicket.ticketNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={`${getStatusColor(selectedTicket.status)} text-foreground ml-2`}>
                    {selectedTicket.status.replace('_', ' ').charAt(0).toUpperCase() + selectedTicket.status.replace('_', ' ').slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <Badge className={`${getPriorityColor(selectedTicket.priority)} text-foreground ml-2`}>
                    {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p className="text-foreground capitalize">{selectedTicket.category}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Title</Label>
                <p className="text-foreground">{selectedTicket.title}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-foreground">{selectedTicket.description}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Submitted By</Label>
                <p className="text-foreground">
                  {selectedTicket.submittedBy.firstName} {selectedTicket.submittedBy.lastName} ({selectedTicket.submittedBy.email})
                </p>
              </div>
              {selectedTicket.assignedTo && (
                <div>
                  <Label className="text-muted-foreground">Assigned To</Label>
                  <p className="text-foreground">
                    {selectedTicket.assignedTo.firstName} {selectedTicket.assignedTo.lastName} ({selectedTicket.assignedTo.email})
                  </p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Created At</Label>
                <p className="text-foreground">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
              </div>
              {selectedTicket.comments && selectedTicket.comments.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Comments ({selectedTicket.comments.length})</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedTicket.comments.map((comment) => (
                      <div key={comment._id} className="bg-input p-3 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {comment.user.firstName} {comment.user.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

export default TicketManagement;