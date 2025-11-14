import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import api from "@/services/auth/api";
import { useToast } from "@/hooks/use-toast";
import { Wrench, Calendar, User, DollarSign } from "lucide-react";

interface ServiceTicket {
  id: number;
  status: string;
  startTime: string;
  endTime?: string;
  totalCost?: number;
  appointment: {
    serviceType: string;
    user: { fullName: string };
    vehicle: { brand: string; model: string };
  };
}

export default function StaffServiceTickets() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get("/api/service-tickets");
      setTickets(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch service tickets",
        variant: "destructive",
      });
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500",
    IN_PROGRESS: "bg-blue-500",
    COMPLETED: "bg-green-500",
    CANCELLED: "bg-red-500",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Service Tickets</h2>
        <p className="text-muted-foreground">
          Track and manage all service tickets
        </p>
      </div>

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Ticket #{ticket.id} - {ticket.appointment.serviceType}
                </CardTitle>
                <Badge className={statusColors[ticket.status]}>
                  {ticket.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{ticket.appointment.user.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <span>{ticket.appointment.vehicle.brand} {ticket.appointment.vehicle.model}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Started: {new Date(ticket.startTime).toLocaleString()}</span>
                  </div>
                  {ticket.endTime && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Ended: {new Date(ticket.endTime).toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {ticket.totalCost && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        ${ticket.totalCost.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Service Ticket #{ticket.id}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Service Information</h4>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Type:</span> {ticket.appointment.serviceType}</p>
                            <p><span className="font-medium">Status:</span> {ticket.status}</p>
                            <p><span className="font-medium">Customer:</span> {ticket.appointment.user.fullName}</p>
                            <p><span className="font-medium">Vehicle:</span> {ticket.appointment.vehicle.brand} {ticket.appointment.vehicle.model}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Timeline</h4>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Started:</span> {new Date(ticket.startTime).toLocaleString()}</p>
                            {ticket.endTime && (
                              <p><span className="font-medium">Completed:</span> {new Date(ticket.endTime).toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                        {ticket.totalCost && (
                          <div>
                            <h4 className="font-semibold mb-2">Cost</h4>
                            <p className="text-2xl font-bold text-primary">
                              ${ticket.totalCost.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
