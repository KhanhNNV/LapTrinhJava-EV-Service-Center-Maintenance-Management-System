import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Wrench, Plus, Edit, Trash2 } from "lucide-react";

interface ServicePackage {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  isActive: boolean;
}

export default function AdminServicePackages() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: "",
    description: "",
    price: 0,
    duration: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await api.get("/api/service-packages");
      setPackages(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch service packages",
        variant: "destructive",
      });
    }
  };

  const createPackage = async () => {
    try {
      await api.post("/api/service-packages", newPackage);
      toast({
        title: "Success",
        description: "Service package created successfully",
      });
      setIsCreateOpen(false);
      setNewPackage({ name: "", description: "", price: 0, duration: 0, isActive: true });
      fetchPackages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create service package",
        variant: "destructive",
      });
    }
  };

  const togglePackageStatus = async (id: number, isActive: boolean) => {
    try {
      await api.put(`/api/service-packages/${id}`, { isActive: !isActive });
      toast({
        title: "Success",
        description: "Package status updated",
      });
      fetchPackages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update package",
        variant: "destructive",
      });
    }
  };

  const deletePackage = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service package?")) return;
    
    try {
      await api.delete(`/api/service-packages/${id}`);
      toast({
        title: "Success",
        description: "Service package deleted successfully",
      });
      fetchPackages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service package",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Service Packages</h2>
          <p className="text-muted-foreground">
            Manage service packages and pricing
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Package
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Service Package</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Package Name</Label>
                <Input
                  value={newPackage.name}
                  onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newPackage.description}
                  onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  value={newPackage.price}
                  onChange={(e) => setNewPackage({ ...newPackage, price: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>Duration (months)</Label>
                <Input
                  type="number"
                  value={newPackage.duration}
                  onChange={(e) => setNewPackage({ ...newPackage, duration: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={newPackage.isActive}
                  onCheckedChange={(checked) => setNewPackage({ ...newPackage, isActive: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createPackage}>Create Package</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  {pkg.name}
                </CardTitle>
                <Badge className={pkg.isActive ? "bg-green-500" : "bg-gray-500"}>
                  {pkg.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{pkg.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-semibold text-lg">${pkg.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{pkg.duration} months</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => togglePackageStatus(pkg.id, pkg.isActive)}
                >
                  {pkg.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deletePackage(pkg.id)}
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
