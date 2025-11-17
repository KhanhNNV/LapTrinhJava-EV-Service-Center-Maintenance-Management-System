import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  Calendar, 
  Clock, 
  DollarSign,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/auth/api';
import { toast } from 'sonner';

export default function CustomerDashboard() {
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['customer-vehicles'],
    queryFn: async () => {
      const response = await api.get('/api/vehicles');
      return response.data;
    },
    retry: 1,
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['customer-appointments'],
    queryFn: async () => {
      const response = await api.get('/api/appointments/myAppointments');
      return response.data;
    },
    retry: 1,
  });

  const stats = [
    {
      title: 'Tổng số xe',
      value: vehicles?.length || 0,
      icon: Car,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Lịch hẹn sắp tới',
      value: appointments?.filter((a: any) => a.status === 'CONFIRMED').length || 0,
      icon: Calendar,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Đang bảo dưỡng',
      value: appointments?.filter((a: any) => a.status === 'IN_PROGRESS').length || 0,
      icon: Clock,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Chi phí tháng này',
      value: '0 VND',
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  const upcomingAppointments = appointments?.filter(
    (a: any) => a.status === 'CONFIRMED' || a.status === 'PENDING'
  ).slice(0, 3) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Chào mừng trở lại!</h2>
        <p className="text-muted-foreground">
          Xem tổng quan về xe và lịch hẹn của bạn
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Lịch hẹn sắp tới</span>
              <Link to="/dashboard/customer/appointments">
                <Button variant="ghost" size="sm">
                  Xem tất cả
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment: any) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{appointment.serviceType || 'Bảo dưỡng định kỳ'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      appointment.status === 'CONFIRMED' 
                        ? 'bg-secondary/10 text-secondary' 
                        : 'bg-accent/10 text-accent'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Chưa có lịch hẹn nào</p>
                <Link to="/dashboard/customer/appointments">
                  <Button className="mt-4 bg-gradient-primary">
                    Đặt lịch ngay
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Vehicles */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Xe của tôi</span>
              <Link to="/dashboard/customer/vehicles">
                <Button variant="ghost" size="sm">
                  Xem tất cả
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vehiclesLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : vehicles && vehicles.length > 0 ? (
              <div className="space-y-3">
                {vehicles.slice(0, 3).map((vehicle: any) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Car className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{vehicle.model || 'Xe điện'}</p>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.licensePlate || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Chưa có xe nào</p>
                <Link to="/dashboard/customer/vehicles">
                  <Button className="mt-4 bg-gradient-primary">
                    Thêm xe
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Reminders */}
      <Card className="shadow-card border-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-accent" />
            Nhắc nhở bảo dưỡng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-accent/5 border border-accent/20 rounded-lg">
              <div>
                <p className="font-medium">Bảo dưỡng định kỳ sắp đến hạn</p>
                <p className="text-sm text-muted-foreground">
                  Xe của bạn cần bảo dưỡng trong vòng 7 ngày tới
                </p>
              </div>
              <Link to="/dashboard/customer/appointments">
                <Button size="sm" className="bg-gradient-primary">
                  Đặt lịch
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/dashboard/customer/appointments">
          <Card className="shadow-card hover:shadow-glow transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Đặt lịch hẹn</h3>
                  <p className="text-sm text-muted-foreground">Đặt lịch bảo dưỡng mới</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/customer/history">
          <Card className="shadow-card hover:shadow-glow transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-secondary flex items-center justify-center">
                  <Clock className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Lịch sử dịch vụ</h3>
                  <p className="text-sm text-muted-foreground">Xem lịch sử bảo dưỡng</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/customer/vehicles">
          <Card className="shadow-card hover:shadow-glow transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Quản lý xe</h3>
                  <p className="text-sm text-muted-foreground">Thêm hoặc chỉnh sửa xe</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
