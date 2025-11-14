import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Plus, Clock, MapPin } from 'lucide-react';
import api from '@/services/auth/api';
import { toast } from 'sonner';

import { ENDPOINTS } from "@/config/endpoints";

export default function Appointments() {
  const queryClient = useQueryClient();
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    serviceType: '',
    appointmentDate: '',
    appointmentTime: '',
    note: '',
    centerId: '',
    contractId: '',
  });

  const { data: vehicles } = useQuery({
    queryKey: ['customer-vehicles'],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.vehicles.list.url);
      return response.data;
    },
  });

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['customer-appointments'],
    queryFn: async () => {
      const response = await api.get('/api/appointments/myAppointments');
      return response.data;
    },
  });

  const bookAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/api/appointments', {
        ...data,
        appointmentDate: `${data.appointmentDate}T${data.appointmentTime}`,
        centerId : 1, // tạm thời fix centerId = 1
        contractId : 1, // tạm thời fix contractId = 1
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-appointments'] });
      toast.success('Đã đặt lịch hẹn thành công!');
      setIsBookingDialogOpen(false);
      setFormData({
        vehicleId: '',
        serviceType: '',
        appointmentDate: '',
        appointmentTime: '',
        note: '',
        centerId: '',
        contractId: '',
      });
    },
    onError: () => {
      toast.error('Không thể đặt lịch. Vui lòng thử lại.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    bookAppointmentMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: 'bg-accent/10 text-accent',
      CONFIRMED: 'bg-secondary/10 text-secondary',
      IN_PROGRESS: 'bg-primary/10 text-primary',
      COMPLETED: 'bg-muted text-muted-foreground',
      CANCELLED: 'bg-destructive/10 text-destructive',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      IN_PROGRESS: 'Đang bảo dưỡng',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
    };
    return texts[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lịch hẹn</h2>
          <p className="text-muted-foreground">
            Quản lý lịch hẹn bảo dưỡng của bạn
          </p>
        </div>

        <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-glow">
              <Plus className="w-4 h-4 mr-2" />
              Đặt lịch mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Đặt lịch hẹn</DialogTitle>
              <DialogDescription>
                Chọn xe và thời gian bảo dưỡng
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Chọn xe</Label>
                  <Select
                    value={formData.vehicleId}
                    onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn xe" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles?.map((vehicle: any) => (
                        <SelectItem key={vehicle.id} value={vehicle.vehicleId}>
                          {vehicle.model} - {vehicle.licensePlate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceType">Loại dịch vụ</Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn dịch vụ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERIODIC_MAINTENANCE">Bảo dưỡng định kỳ</SelectItem>
                      <SelectItem value="REPAIR">Sửa chữa</SelectItem>
                      <SelectItem value="INSPECTION">Kiểm tra tổng quát</SelectItem>
                      <SelectItem value="BATTERY_CHECK">Kiểm tra pin</SelectItem>
                      <SelectItem value="SOFTWARE_UPDATE">Cập nhật phần mềm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointmentDate">Ngày</Label>
                    <Input
                      id="appointmentDate"
                      type="date"
                      value={formData.appointmentDate}
                      onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointmentTime">Giờ</Label>
                    <Input
                      id="appointmentTime"
                      type="time"
                      value={formData.appointmentTime}
                      onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Mô tả vấn đề hoặc yêu cầu đặc biệt..."
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-gradient-primary" disabled={bookAppointmentMutation.isPending}>
                  {bookAppointmentMutation.isPending ? 'Đang đặt...' : 'Đặt lịch hẹn'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-card">
              <CardContent className="pt-6">
                <div className="h-24 bg-muted animate-pulse rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : appointments && appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((appointment: any) => (
            <Card key={appointment.id} className="shadow-card hover:shadow-glow transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {appointment.serviceType || 'Bảo dưỡng định kỳ'}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(appointment.appointmentDate).toLocaleString('vi-VN')}</span>
                        </div>
                        {appointment.serviceCenter && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{appointment.serviceCenter.name}</span>
                          </div>
                        )}
                        {appointment.note && (
                          <p className="mt-2 text-foreground">{appointment.note}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {appointment.status === 'PENDING' && (
                    <Button variant="outline" size="sm" className="hover:bg-destructive/10 hover:text-destructive">
                      Hủy lịch
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có lịch hẹn nào</h3>
            <p className="text-muted-foreground mb-4">
              Đặt lịch hẹn bảo dưỡng đầu tiên của bạn
            </p>
            <Button className="bg-gradient-primary" onClick={() => setIsBookingDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Đặt lịch ngay
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
