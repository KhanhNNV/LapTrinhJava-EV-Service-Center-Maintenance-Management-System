import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Building2, MapPin, Phone, Edit, Trash2 } from "lucide-react";

interface ServiceCenter {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  description: string;
}

export default function AdminServiceCenters() {
  const { toast } = useToast();
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCenter, setNewCenter] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    description: "",
  });

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const response = await api.get("/api/service-centers");
      setCenters(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch service centers",
        variant: "destructive",
      });
    }
  };

  const createCenter = async () => {
    try {
      await api.post("/api/service-centers", newCenter);
      toast({
        title: "Success",
        description: "Service center created successfully",
      });
      setIsCreateOpen(false);
      setNewCenter({ name: "", address: "", phoneNumber: "", description: "" });
      fetchCenters();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create service center",
        variant: "destructive",
      });
    }
  };

  const deleteCenter = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service center?")) return;
    
    try {
      await api.delete(`/api/service-centers/${id}`);
      toast({
        title: "Success",
        description: "Service center deleted successfully",
      });
      fetchCenters();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service center",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Service Centers</h2>
          <p className="text-muted-foreground">
            Manage all service center locations
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Building2 className="h-4 w-4 mr-2" />
              Add Service Center
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Service Center</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={newCenter.name}
                  onChange={(e) => setNewCenter({ ...newCenter, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={newCenter.address}
                  onChange={(e) => setNewCenter({ ...newCenter, address: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={newCenter.phoneNumber}
                  onChange={(e) => setNewCenter({ ...newCenter, phoneNumber: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newCenter.description}
                  onChange={(e) => setNewCenter({ ...newCenter, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createCenter}>Create Center</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {centers.map((center) => (
          <Card key={center.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                {center.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{center.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{center.phoneNumber}</span>
              </div>
              <p className="text-sm text-muted-foreground">{center.description}</p>
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteCenter(center.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
