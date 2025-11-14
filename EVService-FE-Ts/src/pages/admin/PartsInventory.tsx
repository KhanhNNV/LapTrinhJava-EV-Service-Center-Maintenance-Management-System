import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Edit, Trash2, AlertCircle } from "lucide-react";

interface Part {
  id: number;
  name: string;
  partNumber: string;
  price: number;
  quantityInStock: number;
  minimumStock: number;
}

export default function AdminPartsInventory() {
  const { toast } = useToast();
  const [parts, setParts] = useState<Part[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPart, setNewPart] = useState({
    name: "",
    partNumber: "",
    price: 0,
    quantityInStock: 0,
    minimumStock: 0,
  });

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const response = await api.get("/api/parts");
      setParts(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch parts",
        variant: "destructive",
      });
    }
  };

  const createPart = async () => {
    try {
      await api.post("/api/parts", newPart);
      toast({
        title: "Success",
        description: "Part created successfully",
      });
      setIsCreateOpen(false);
      setNewPart({ name: "", partNumber: "", price: 0, quantityInStock: 0, minimumStock: 0 });
      fetchParts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create part",
        variant: "destructive",
      });
    }
  };

  const deletePart = async (id: number) => {
    if (!confirm("Are you sure you want to delete this part?")) return;
    
    try {
      await api.delete(`/api/parts/${id}`);
      toast({
        title: "Success",
        description: "Part deleted successfully",
      });
      fetchParts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete part",
        variant: "destructive",
      });
    }
  };

  const lowStockParts = parts.filter(p => p.quantityInStock <= p.minimumStock);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Parts Inventory</h2>
          <p className="text-muted-foreground">
            Manage spare parts and inventory
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Part
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Part</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Part Name</Label>
                <Input
                  value={newPart.name}
                  onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Part Number</Label>
                <Input
                  value={newPart.partNumber}
                  onChange={(e) => setNewPart({ ...newPart, partNumber: e.target.value })}
                />
              </div>
              <div>
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  value={newPart.price}
                  onChange={(e) => setNewPart({ ...newPart, price: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>Quantity in Stock</Label>
                <Input
                  type="number"
                  value={newPart.quantityInStock}
                  onChange={(e) => setNewPart({ ...newPart, quantityInStock: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Minimum Stock Level</Label>
                <Input
                  type="number"
                  value={newPart.minimumStock}
                  onChange={(e) => setNewPart({ ...newPart, minimumStock: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createPart}>Add Part</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {lowStockParts.length > 0 && (
        <Card className="border-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-500">
              <AlertCircle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              The following parts are running low on stock:
            </p>
            <div className="space-y-1">
              {lowStockParts.map((part) => (
                <div key={part.id} className="text-sm">
                  <span className="font-medium">{part.name}</span> - 
                  <span className="text-orange-500 ml-1">
                    {part.quantityInStock} units (min: {part.minimumStock})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Parts ({parts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>In Stock</TableHead>
                <TableHead>Min Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts.map((part) => (
                <TableRow key={part.id}>
                  <TableCell className="font-medium">{part.partNumber}</TableCell>
                  <TableCell>{part.name}</TableCell>
                  <TableCell>${part.price.toFixed(2)}</TableCell>
                  <TableCell>{part.quantityInStock}</TableCell>
                  <TableCell>{part.minimumStock}</TableCell>
                  <TableCell>
                    {part.quantityInStock <= part.minimumStock ? (
                      <Badge variant="destructive">Low Stock</Badge>
                    ) : part.quantityInStock <= part.minimumStock * 2 ? (
                      <Badge className="bg-orange-500">Medium</Badge>
                    ) : (
                      <Badge className="bg-green-500">In Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePart(part.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
