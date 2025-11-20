import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  Calendar, 
  Clock, 
  DollarSign,
  ArrowRight,
  AlertCircle,
  Bike
} from 'lucide-react';
import { 
    useCustomerVehicles, 
    useCustomerAppointments, 
    AppointmentDto, 
    VehicleDto 
} from '@/services/appointmentService.ts';

export default function CustomerDashboard() {
  // 1. Sử dụng Hooks từ service để tận dụng caching
  const { data: vehicles, isLoading: vehiclesLoading } = useCustomerVehicles();
  const { data: appointments, isLoading: appointmentsLoading } = useCustomerAppointments();

  // 2. Logic lọc trạng thái mới
  // Active: Tất cả trạng thái ngoại trừ COMPLETED và CANCELED
  const activeAppointments = appointments?.filter((a: AppointmentDto) => 
    !['COMPLETED', 'CANCELED'].includes(a.status)
  ) || [];

  // Lấy 3 lịch hẹn gần nhất để hiển thị
  const upcomingAppointments = activeAppointments
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
    .slice(0, 3);

  // Helper: Màu sắc trạng thái (Đồng bộ với Appointments.tsx)
  const getStatusColor = (status: string) => {
    const colors: any = {
        PENDING:     "bg-yellow-100 text-yellow-700",
        CONFIRMED:   "bg-blue-100 text-blue-700",
        CHECKED_IN:  "bg-indigo-100 text-indigo-700",
        ASSIGNED:    "bg-cyan-100 text-cyan-700",
        IN_PROGRESS: "bg-purple-100 text-purple-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

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
      value: activeAppointments.length, // Đếm tất cả lịch đang active
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Đang bảo dưỡng',
      value: appointments?.filter((a: AppointmentDto) => a.status === 'IN_PROGRESS').length || 0,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Chi phí tháng này',
      value: '0 VND', // Tạm thời hardcode vì chưa có API Transaction
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Chào mừng trở lại!</h2>
        <p className="text-muted-foreground">
          Xem tổng quan về xe và lịch hẹn của bạn
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-sm border-gray-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card className="shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span>Lịch hẹn sắp tới</span>
              <Link to="/dashboard/customer/appointments">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
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
                  <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment: AppointmentDto) => (
                  <div
                    // FIX: Sử dụng appointmentId
                    key={appointment.appointmentId} 
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{appointment.serviceType}</p>
                        <p className="text-xs text-muted-foreground">
                           {appointment.appointmentTime} - {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Chưa có lịch hẹn nào</p>
                <Link to="/dashboard/customer/appointments">
                  <Button className="mt-4 bg-[#007AFF] hover:bg-[#0066CC]">
                    Đặt lịch ngay
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Vehicles */}
        <Card className="shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span>Xe của tôi</span>
              <Link to="/dashboard/customer/vehicles">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
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
                  <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : vehicles && vehicles.length > 0 ? (
              <div className="space-y-3">
                {vehicles.slice(0, 3).map((vehicle: VehicleDto) => (
                  <div
                    // FIX: Sử dụng vehicleId
                    key={vehicle.vehicleId}
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          vehicle.vehicleType === 'ELECTRIC_CAR' ? 'bg-blue-50' : 'bg-green-50'
                      }`}>
                        {/* Logic Icon xe */}
                        {vehicle.vehicleType === 'ELECTRIC_CAR' 
                            ? <Car className="w-5 h-5 text-blue-600" /> 
                            : <Bike className="w-5 h-5 text-green-600" />}
                      </div>
                      <div>
                        {/* Hiển thị Brand + Model */}
                        <p className="font-medium text-sm text-gray-900">{vehicle.brand} {vehicle.model}</p>
                        <p className="text-xs text-muted-foreground">
                          {vehicle.licensePlate}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Chưa có xe nào</p>
                <Link to="/dashboard/customer/vehicles">
                  <Button className="mt-4 bg-[#007AFF] hover:bg-[#0066CC]">
                    Thêm xe
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Reminders - Phần này có thể phát triển thêm logic kiểm tra ngày bảo dưỡng */}
      <Card className="shadow-sm border-orange-100 bg-orange-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700 text-lg">
            <AlertCircle className="w-5 h-5" />
            Nhắc nhở bảo dưỡng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-white border border-orange-100 rounded-lg shadow-sm">
            <div>
              <p className="font-medium text-gray-900">Kiểm tra định kỳ</p>
              <p className="text-sm text-muted-foreground">
                Đừng quên đặt lịch bảo dưỡng định kỳ để đảm bảo an toàn.
              </p>
            </div>
            <Link to="/dashboard/customer/appointments">
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                Đặt lịch ngay
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/dashboard/customer/appointments">
          <Card className="shadow-sm border-gray-100 hover:shadow-md transition-all cursor-pointer hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Đặt lịch hẹn</h3>
                  <p className="text-sm text-muted-foreground">Đặt lịch bảo dưỡng mới</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/customer/history">
          <Card className="shadow-sm border-gray-100 hover:shadow-md transition-all cursor-pointer hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Lịch sử dịch vụ</h3>
                  <p className="text-sm text-muted-foreground">Xem lịch sử bảo dưỡng</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/customer/vehicles">
          <Card className="shadow-sm border-gray-100 hover:shadow-md transition-all cursor-pointer hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Car className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quản lý xe</h3>
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