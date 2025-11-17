import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import api from "@/services/api.ts";
import { useToast } from "@/hooks/use-toast";
import { Search, Mail, Phone, Car } from "lucide-react";

interface Customer {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  vehicles?: any[];
  appointments?: any[];
}

export default function StaffCustomers() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/api/users/role/CUSTOMER");
      setCustomers(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive",
      });
    }
  };

  const fetchCustomerDetails = async (customerId: number) => {
    try {
      const [vehiclesRes, appointmentsRes] = await Promise.all([
        api.get("/api/vehicles/api/vehicles").then(res => 
          res.data.filter((v: any) => v.userId === customerId)
        ),
        api.get("/api/appointments/api/appointments").then(res =>
          res.data.filter((a: any) => a.userId === customerId)
        ),
      ]);

      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setSelectedCustomer({
          ...customer,
          vehicles: vehiclesRes,
          appointments: appointmentsRes,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch customer details",
        variant: "destructive",
      });
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phoneNumber?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Customer Management</h2>
        <p className="text-muted-foreground">
          View and manage customer information
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{customer.fullName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{customer.phoneNumber || "N/A"}</span>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => fetchCustomerDetails(customer.id)}
                  >
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{selectedCustomer?.fullName}</DialogTitle>
                  </DialogHeader>
                  
                  {selectedCustomer && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-2">Contact Information</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Email:</span> {selectedCustomer.email}</p>
                          <p><span className="font-medium">Phone:</span> {selectedCustomer.phoneNumber || "N/A"}</p>
                          <p><span className="font-medium">Username:</span> {selectedCustomer.username}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          Vehicles ({selectedCustomer.vehicles?.length || 0})
                        </h4>
                        <div className="space-y-2">
                          {selectedCustomer.vehicles?.map((vehicle: any) => (
                            <div key={vehicle.id} className="p-3 border rounded-lg">
                              <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                              <p className="text-sm text-muted-foreground">
                                {vehicle.licensePlate} • {vehicle.year}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">
                          Recent Appointments ({selectedCustomer.appointments?.length || 0})
                        </h4>
                        <div className="space-y-2">
                          {selectedCustomer.appointments?.slice(0, 5).map((appointment: any) => (
                            <div key={appointment.id} className="p-3 border rounded-lg flex justify-between items-center">
                              <div>
                                <p className="font-medium">{appointment.serviceType}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(appointment.appointmentDate).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge>{appointment.status}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
