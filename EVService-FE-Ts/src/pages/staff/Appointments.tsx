import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/services/api.ts";
import { useToast } from "@/hooks/use-toast";
import { Calendar, User, Car } from "lucide-react";

interface Appointment {
  id: number;
  appointmentDate: string;
  status: string;
  serviceType: string;
  vehicle: { brand: string; model: string };
  user: { fullName: string };
}

export default function StaffAppointments() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<number | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<string>("");

  useEffect(() => {
    fetchAppointments();
    fetchTechnicians();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get("/api/appointments");
      setAppointments(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive",
      });
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await api.get("/api/users/role/TECHNICIAN");
      setTechnicians(response.data);
    } catch (error) {
      console.error("Failed to fetch technicians");
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/api/appointments/${id}`, { status });
      toast({
        title: "Success",
        description: "Appointment status updated",
      });
      fetchAppointments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    }
  };

  const assignTechnician = async () => {
    if (!selectedAppointment || !selectedTechnician) return;
    
    try {
      await api.put(`/api/appointments/${selectedAppointment}/assignTechnician`, {
        technicianId: selectedTechnician,
      });
      toast({
        title: "Success",
        description: "Technician assigned successfully",
      });
      fetchAppointments();
      setSelectedAppointment(null);
      setSelectedTechnician("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign technician",
        variant: "destructive",
      });
    }
  };

  const groupedAppointments = {
    PENDING: appointments.filter(a => a.status === "PENDING"),
    CONFIRMED: appointments.filter(a => a.status === "CONFIRMED"),
    CHECKED_IN: appointments.filter(a => a.status === "CHECKED_IN"),
    COMPLETED: appointments.filter(a => a.status === "COMPLETED"),
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500",
    CONFIRMED: "bg-blue-500",
    CHECKED_IN: "bg-orange-500",
    COMPLETED: "bg-green-500",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Appointments Management</h2>
        <p className="text-muted-foreground">
          Kanban board for managing appointments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(groupedAppointments).map(([status, items]) => (
          <div key={status} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
              <h3 className="font-semibold">{status}</h3>
              <Badge variant="secondary">{items.length}</Badge>
            </div>

            <div className="space-y-2">
              {items.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm">
                      {appointment.serviceType}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{appointment.user.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Car className="h-3 w-3" />
                      <span>{appointment.vehicle.brand} {appointment.vehicle.model}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {status === "PENDING" && (
                        <Button
                          size="sm"
                          onClick={() => updateStatus(appointment.id, "CONFIRMED")}
                          className="w-full"
                        >
                          Confirm
                        </Button>
                      )}
                      {status === "CONFIRMED" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setSelectedAppointment(appointment.id)}
                              className="w-full"
                            >
                              Assign Tech
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Technician</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select technician" />
                                </SelectTrigger>
                                <SelectContent>
                                  {technicians.map((tech) => (
                                    <SelectItem key={tech.id} value={tech.id.toString()}>
                                      {tech.fullName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button onClick={assignTechnician} className="w-full">
                                Assign
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
