import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import { Wrench, Plus, CheckCircle } from "lucide-react";

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

export default function TechnicianServiceTickets() {
  const { toast } = useToast();
  const currentUser = authService.getCurrentUser();
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [serviceItems, setServiceItems] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [newPart, setNewPart] = useState({ partId: "", quantity: 1 });
  const [newServiceItem, setNewServiceItem] = useState({ itemId: "" });

  useEffect(() => {
    fetchTickets();
    fetchParts();
    fetchServiceItems();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get("/api/service-tickets");
      const myTickets = response.data.filter(
        (t: any) => t.appointment?.technicianId === currentUser?.id
      );
      setTickets(myTickets);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch service tickets",
        variant: "destructive",
      });
    }
  };

  const fetchParts = async () => {
    try {
      const response = await api.get("/api/parts");
      setParts(response.data);
    } catch (error) {
      console.error("Failed to fetch parts");
    }
  };

  const fetchServiceItems = async () => {
    try {
      const response = await api.get("/api/service-items");
      setServiceItems(response.data);
    } catch (error) {
      console.error("Failed to fetch service items");
    }
  };

  const addPartToTicket = async () => {
    if (!selectedTicket) return;
    
    try {
      await api.put(`/api/service-tickets/${selectedTicket}/parts`, {
        partId: parseInt(newPart.partId),
        quantity: newPart.quantity,
      });
      toast({
        title: "Success",
        description: "Part added to service ticket",
      });
      setNewPart({ partId: "", quantity: 1 });
      fetchTickets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add part",
        variant: "destructive",
      });
    }
  };

  const addServiceItemToTicket = async () => {
    if (!selectedTicket) return;
    
    try {
      await api.post(`/api/service-tickets/${selectedTicket}/service-items`, {
        itemId: parseInt(newServiceItem.itemId),
      });
      toast({
        title: "Success",
        description: "Service item added",
      });
      setNewServiceItem({ itemId: "" });
      fetchTickets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add service item",
        variant: "destructive",
      });
    }
  };

  const completeTicket = async (ticketId: number) => {
    try {
      await api.put(`/api/service-tickets/technician/${ticketId}/complete`);
      toast({
        title: "Success",
        description: "Service ticket completed",
      });
      fetchTickets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete ticket",
        variant: "destructive",
      });
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500",
    IN_PROGRESS: "bg-blue-500",
    COMPLETED: "bg-green-500",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Service Tickets</h2>
        <p className="text-muted-foreground">
          Manage your service tickets
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
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium">{ticket.appointment.user.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle</p>
                    <p className="font-medium">
                      {ticket.appointment.vehicle.brand} {ticket.appointment.vehicle.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Time</p>
                    <p className="font-medium">{new Date(ticket.startTime).toLocaleString()}</p>
                  </div>
                  {ticket.totalCost && (
                    <div>
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                      <p className="font-medium text-lg">${ticket.totalCost.toFixed(2)}</p>
                    </div>
                  )}
                </div>

                {ticket.status === "IN_PROGRESS" && (
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTicket(ticket.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Part
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Part to Service</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Select Part</Label>
                            <Select value={newPart.partId} onValueChange={(value) => setNewPart({ ...newPart, partId: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a part" />
                              </SelectTrigger>
                              <SelectContent>
                                {parts.map((part) => (
                                  <SelectItem key={part.id} value={part.id.toString()}>
                                    {part.name} - ${part.price}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={newPart.quantity}
                              onChange={(e) => setNewPart({ ...newPart, quantity: parseInt(e.target.value) })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={addPartToTicket}>Add Part</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTicket(ticket.id)}
                        >
                          <Wrench className="h-4 w-4 mr-2" />
                          Add Service
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Service Item</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Select Service</Label>
                            <Select value={newServiceItem.itemId} onValueChange={(value) => setNewServiceItem({ itemId: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a service" />
                              </SelectTrigger>
                              <SelectContent>
                                {serviceItems.map((item) => (
                                  <SelectItem key={item.id} value={item.id.toString()}>
                                    {item.name} - ${item.price}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={addServiceItemToTicket}>Add Service</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      onClick={() => completeTicket(ticket.id)}
                      className="ml-auto"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Service
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
