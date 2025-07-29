import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { appointmentService, Appointment, CreateAppointmentData, Staff } from "@/services/appointmentService";
import { 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  GraduationCap,
  Bell,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Eye
} from "lucide-react";

interface AppointmentFormData {
  staffId: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  purpose: string;
  description?: string;
}

const Appointments = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffLoading, setStaffLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [date, setDate] = useState<Date>();
  const [cancellationReason, setCancellationReason] = useState('');

  const form = useForm<AppointmentFormData>({
    defaultValues: {
      staffId: '',
      location: '',
      purpose: '',
      description: ''
    }
  });

  const editForm = useForm<AppointmentFormData>({
    defaultValues: {
      staffId: '',
      location: '',
      purpose: '',
      description: ''
    }
  });

  // Fetch appointments and staff on component mount
  useEffect(() => {
    fetchAppointments();
    fetchStaff();
  }, []);

  // Debug staff state changes
  useEffect(() => {
    console.log('🔄 Staff state updated:', staff);
    console.log('📝 Staff array length:', staff.length);
  }, [staff]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      console.log('Fetching appointments for role:', user?.role || 'student');
      const response = await appointmentService.getAppointmentsByRole(user?.role || 'student');
      console.log('Appointments response:', response);
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      setStaffLoading(true);
      console.log('🔍 Fetching staff members...');
      const response = await appointmentService.getAvailableStaff();
      console.log('📋 Staff API response:', response);
      console.log('👥 Staff members found:', response.data.staff);
      console.log('📊 Staff count:', response.count);
      setStaff(response.data.staff);
    } catch (error) {
      console.error('❌ Error fetching staff:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      
      // More specific error message based on the error
      let errorMessage = "Failed to load staff members. Please try again.";
      if (error.response?.status === 404) {
        errorMessage = "Staff endpoint not found. Please check the API configuration.";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (error.response?.status === 403) {
        errorMessage = "Access denied. You don't have permission to view staff members.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setStaffLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "no_show":
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "confirmed":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "no_show":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString; // Already in HH:MM AM/PM format
  };

  const getPurposeLabel = (purpose: string) => {
    switch (purpose) {
      case 'office_hours':
        return 'Office Hours';
      case 'project_review':
        return 'Project Review';
      case 'consultation':
        return 'Consultation';
      case 'thesis_meeting':
        return 'Thesis Meeting';
      case 'academic_advising':
        return 'Academic Advising';
      case 'other':
        return 'Other';
      default:
        return purpose;
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date for your appointment.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      console.log('Form data received:', data);
      console.log('Selected date:', date);
      
      const appointmentData: CreateAppointmentData = {
        staffId: data.staffId,
        date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        purpose: data.purpose as any,
        description: data.description
      };

      console.log('Creating appointment with data:', appointmentData);
      const response = await appointmentService.createAppointment(appointmentData);
      console.log('Appointment creation response:', response);
      
      toast({
        title: "Appointment booked successfully",
        description: "Your appointment request has been submitted for approval."
      });
      
      form.reset();
      setDate(undefined);
      setIsDialogOpen(false);
      fetchAppointments(); // Refresh the appointments list
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to create appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsViewDialogOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    editForm.reset({
      staffId: appointment.staff._id,
      location: appointment.location,
      purpose: appointment.purpose,
      description: appointment.description || ''
    });
    setDate(new Date(appointment.date));
    setIsEditDialogOpen(true);
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsCancelDialogOpen(true);
  };

  const onEditSubmit = async (data: AppointmentFormData) => {
    if (!selectedAppointment || !date) return;

    try {
      setSubmitting(true);
      
      const updateData = {
        date: date.toISOString().split('T')[0],
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        purpose: data.purpose as any,
        description: data.description
      };

      await appointmentService.updateAppointment(selectedAppointment._id, updateData);
      
      toast({
        title: "Appointment updated successfully",
        description: "Your appointment has been updated."
      });
      
      setIsEditDialogOpen(false);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onCancelSubmit = async () => {
    if (!selectedAppointment) return;

    try {
      setSubmitting(true);
      
      await appointmentService.cancelAppointment(selectedAppointment._id, cancellationReason);
      
      toast({
        title: "Appointment cancelled successfully",
        description: "Your appointment has been cancelled."
      });
      
      setIsCancelDialogOpen(false);
      setCancellationReason('');
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await appointmentService.confirmAppointment(appointmentId);
      toast({
        title: "Appointment confirmed",
        description: "The appointment has been confirmed."
      });
      fetchAppointments();
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast({
        title: "Error",
        description: "Failed to confirm appointment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      await appointmentService.completeAppointment(appointmentId);
      toast({
        title: "Appointment completed",
        description: "The appointment has been marked as completed."
      });
      fetchAppointments();
    } catch (error) {
      console.error('Error completing appointment:', error);
      toast({
        title: "Error",
        description: "Failed to complete appointment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];

  const purposes = [
    { value: 'office_hours', label: 'Office Hours' },
    { value: 'project_review', label: 'Project Review' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'thesis_meeting', label: 'Thesis Meeting' },
    { value: 'academic_advising', label: 'Academic Advising' },
    { value: 'other', label: 'Other' }
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
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
              <Link to="/chat" className="text-muted-foreground hover:text-foreground">Chat</Link>
              <Link to="/tickets" className="text-muted-foreground hover:text-foreground">Support</Link>
              <Link to="/appointments" className="text-primary font-medium">Appointments</Link>
              <Link to="/announcements" className="text-muted-foreground hover:text-foreground">Announcements</Link>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Appointments</h1>
              <p className="text-muted-foreground">Book and manage your appointments with academic staff.</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Book Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Book New Appointment</DialogTitle>
                  <DialogDescription>
                    Select staff member, date and time for your appointment.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="staffId"
                      rules={{ required: 'Staff member is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Staff Member</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select staff member" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {staffLoading ? (
                                <SelectItem value="" disabled>
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Loading staff members...
                                  </div>
                                </SelectItem>
                              ) : staff.length === 0 ? (
                                <SelectItem value="" disabled>
                                  No staff members available
                                </SelectItem>
                              ) : (
                                staff.map((member) => (
                                  <SelectItem key={member._id} value={member._id}>
                                    {member.firstName} {member.lastName} {member.department && `(${member.department})`}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormField
                      control={form.control}
                      name="startTime"
                      rules={{ required: 'Start time is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select start time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endTime"
                      rules={{ required: 'End time is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select end time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      rules={{ required: 'Location is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Room 301, Building A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="purpose"
                      rules={{ required: 'Purpose is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purpose</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select purpose" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {purposes.map((purpose) => (
                                <SelectItem key={purpose.value} value={purpose.value}>
                                  {purpose.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Additional details about your appointment..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Booking...
                          </>
                        ) : (
                          "Book Appointment"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Appointments List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Your Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading appointments...</span>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No appointments found.</p>
                  <p className="text-sm">Book your first appointment to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment._id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(appointment.status)}
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {appointment.staff.firstName[0]}{appointment.staff.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium mb-1">
                            {appointment.staff.firstName} {appointment.staff.lastName}
                            {appointment.staff.department && ` (${appointment.staff.department})`}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              <span>{formatDate(appointment.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{appointment.startTime} - {appointment.endTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{appointment.location}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {getPurposeLabel(appointment.purpose)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(appointment.status)}>
                          {appointment.status.replace('_', ' ')}
                        </Badge>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewAppointment(appointment)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditAppointment(appointment)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleCancelAppointment(appointment)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {user?.role === 'lecturer' && appointment.status === 'pending' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleConfirmAppointment(appointment._id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {user?.role === 'lecturer' && appointment.status === 'confirmed' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCompleteAppointment(appointment._id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Appointment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Staff Member</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.staff.firstName} {selectedAppointment.staff.lastName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Department</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.staff.department || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedAppointment.date)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Time</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.startTime} - {selectedAppointment.endTime}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.location}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Purpose</Label>
                  <p className="text-sm text-muted-foreground">
                    {getPurposeLabel(selectedAppointment.purpose)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={getStatusBadgeVariant(selectedAppointment.status)}>
                    {selectedAppointment.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              {selectedAppointment.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.description}
                  </p>
                </div>
              )}
              {selectedAppointment.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}
              {selectedAppointment.cancellationReason && (
                <div>
                  <Label className="text-sm font-medium">Cancellation Reason</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.cancellationReason}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>
              Update your appointment details.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <FormField
                control={editForm.control}
                name="startTime"
                rules={{ required: 'Start time is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select start time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="endTime"
                rules={{ required: 'End time is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select end time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="location"
                rules={{ required: 'Location is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Room 301, Building A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="purpose"
                rules={{ required: 'Purpose is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {purposes.map((purpose) => (
                          <SelectItem key={purpose.value} value={purpose.value}>
                            {purpose.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional details about your appointment..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Appointment"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Cancel Appointment Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancellationReason">Cancellation Reason (Optional)</Label>
              <Textarea
                id="cancellationReason"
                placeholder="Please provide a reason for cancellation..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                Keep Appointment
              </Button>
              <Button 
                variant="destructive" 
                onClick={onCancelSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Appointment"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointments;