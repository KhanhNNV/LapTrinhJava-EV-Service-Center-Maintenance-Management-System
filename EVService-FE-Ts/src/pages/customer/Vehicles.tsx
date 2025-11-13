import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Car, Plus, Edit, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function Vehicles() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    model: '',
    licensePlate: '',
    vin: '',
    year: '',
    color: '',
  });

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['customer-vehicles'],
    queryFn: async () => {
      const response = await api.get('/api/vehicles');
      return response.data;
    },
  });

  const addVehicleMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/api/vehicles', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-vehicles'] });
      toast.success('Đã thêm xe thành công!');
      setIsAddDialogOpen(false);
      setFormData({ model: '', licensePlate: '', vin: '', year: '', color: '' });
    },
    onError: () => {
      toast.error('Không thể thêm xe. Vui lòng thử lại.');
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/vehicles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-vehicles'] });
      toast.success('Đã xóa xe thành công!');
    },
    onError: () => {
      toast.error('Không thể xóa xe. Vui lòng thử lại.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVehicleMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Xe của tôi</h2>
          <p className="text-muted-foreground">
            Quản lý thông tin xe điện của bạn
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-glow">
              <Plus className="w-4 h-4 mr-2" />
              Thêm xe mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm xe mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin xe điện của bạn
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model xe</Label>
                  <Input
                    id="model"
                    placeholder="VD: Tesla Model 3"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licensePlate">Biển số xe</Label>
                  <Input
                    id="licensePlate"
                    placeholder="VD: 30A-12345"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vin">VIN</Label>
                  <Input
                    id="vin"
                    placeholder="Số khung xe"
                    value={formData.vin}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Năm sản xuất</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="2024"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Màu sắc</Label>
                    <Input
                      id="color"
                      placeholder="Đỏ"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-gradient-primary" disabled={addVehicleMutation.isPending}>
                  {addVehicleMutation.isPending ? 'Đang thêm...' : 'Thêm xe'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-card">
              <CardContent className="pt-6">
                <div className="h-40 bg-muted animate-pulse rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : vehicles && vehicles.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle: any) => (
            <Card key={vehicle.id} className="shadow-card hover:shadow-glow transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <Car className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-lg">{vehicle.model}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Biển số:</span>
                    <span className="font-medium">{vehicle.licensePlate}</span>
                  </div>
                  {vehicle.vin && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">VIN:</span>
                      <span className="font-medium text-xs">{vehicle.vin}</span>
                    </div>
                  )}
                  {vehicle.year && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Năm:</span>
                      <span className="font-medium">{vehicle.year}</span>
                    </div>
                  )}
                  {vehicle.color && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Màu:</span>
                      <span className="font-medium">{vehicle.color}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn xóa xe này?')) {
                        deleteVehicleMutation.mutate(vehicle.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có xe nào</h3>
            <p className="text-muted-foreground mb-4">
              Thêm xe đầu tiên của bạn để bắt đầu
            </p>
            <Button className="bg-gradient-primary" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm xe mới
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
