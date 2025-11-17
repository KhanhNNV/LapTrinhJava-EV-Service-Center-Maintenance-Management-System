import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/services/api.ts";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth.ts";
import { Calendar, User, Car, MapPin } from "lucide-react";

interface Appointment {
  id: number;
  appointmentDate: string;
  status: string;
  serviceType: string;
  vehicle: { brand: string; model: string; licensePlate: string };
  user: { fullName: string; phoneNumber: string };
  serviceCenter: { name: string; address: string };
}

export default function TechnicianMyAppointments() {
  const { toast } = useToast();
  const currentUser = authService.getCurrentUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get("/api/appointments/technician");
      const myAppointments = response.data.filter(
        (a: any) => a.technicianId === currentUser?.id
      );
      setAppointments(myAppointments);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive",
      });
    }
  };

  const checkInAppointment = async (id: number) => {
    try {
      await api.put(`/api/appointments/${id}/check-in`);
      toast({
        title: "Success",
        description: "Customer checked in",
      });
      fetchAppointments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check in",
        variant: "destructive",
      });
    }
  };

  const createServiceTicket = async (appointmentId: number) => {
    try {
      await api.post(`/api/service-tickets/technician/${appointmentId}/create-service-ticket`);
      toast({
        title: "Success",
        description: "Service ticket created",
      });
      fetchAppointments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create service ticket",
        variant: "destructive",
      });
    }
  };

  const statusColors: Record<string, string> = {
    CONFIRMED: "bg-blue-500",
    CHECKED_IN: "bg-orange-500",
    IN_PROGRESS: "bg-yellow-500",
    COMPLETED: "bg-green-500",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Appointments</h2>
        <p className="text-muted-foreground">
          Appointments assigned to you
        </p>
      </div>

      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {appointment.serviceType}
                </CardTitle>
                <Badge className={statusColors[appointment.status]}>
                  {appointment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(appointment.appointmentDate).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p>{appointment.user.fullName}</p>
                      <p className="text-muted-foreground">{appointment.user.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p>{appointment.vehicle.brand} {appointment.vehicle.model}</p>
                      <p className="text-muted-foreground">{appointment.vehicle.licensePlate}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{appointment.serviceCenter.name}</p>
                      <p className="text-muted-foreground">{appointment.serviceCenter.address}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    {appointment.status === "CONFIRMED" && (
                      <Button
                        onClick={() => checkInAppointment(appointment.id)}
                        className="w-full"
                      >
                        Check In Customer
                      </Button>
                    )}
                    {appointment.status === "CHECKED_IN" && (
                      <Button
                        onClick={() => createServiceTicket(appointment.id)}
                        className="w-full"
                      >
                        Start Service
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
