import { Card, CardContent } from '@/components/ui/card';
import { History as HistoryIcon, Calendar, Clock, MapPin, Car } from 'lucide-react';
import { useCustomerAppointments, AppointmentDto } from '@/services/appointmentService.ts';

export default function History() {
  // 1. Lấy dữ liệu từ API
  const { data: appointments, isLoading } = useCustomerAppointments();

  // 2. Logic lọc: Chỉ lấy COMPLETED và CANCELED
  const historyAppointments = appointments?.filter((a: AppointmentDto) => 
    ['COMPLETED', 'CANCELED'].includes(a.status)
  ) || [];

  // Helper: Màu sắc trạng thái (chỉ cần cho Completed và Canceled)
  const getStatusColor = (status: string) => {
    const colors: any = {
      COMPLETED: "bg-green-100 text-green-700 border-green-200",
      CANCELED: "bg-red-100 text-red-700 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  // Helper: Text tiếng Việt
  const getStatusText = (status: string) => {
    const texts: any = {
      COMPLETED: "Hoàn thành",
      CANCELED: "Đã hủy",
    };
    return texts[status] || status;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Lịch sử dịch vụ</h2>
        <p className="text-muted-foreground">
          Xem lại các lịch hẹn đã hoàn thành hoặc đã hủy
        </p>
      </div>

      {isLoading ? (
        // Loading State
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="shadow-sm border-gray-100">
              <CardContent className="pt-6">
                <div className="h-24 bg-gray-100 animate-pulse rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : historyAppointments.length > 0 ? (
        // List Lịch sử
        <div className="space-y-4">
          {historyAppointments.map((appointment: AppointmentDto) => (
            <Card key={appointment.appointmentId} className="shadow-sm border-gray-100 hover:shadow-md transition-shadow opacity-90 hover:opacity-100">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon mờ hơn để thể hiện lịch sử */}
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                      <HistoryIcon className="w-6 h-6 text-gray-500" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {appointment.serviceType}
                        </h3>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>

                      <div className="text-sm text-gray-500 space-y-1.5">
                        <div className="flex items-center gap-2">
                            <Car className="w-4 h-4" />
                            <span>Xe ID: {appointment.vehicleId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {appointment.appointmentTime} - {new Date(appointment.appointmentDate).toLocaleDateString("vi-VN")}
                          </span>
                        </div>

                        {appointment.centerId && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>Trung tâm số {appointment.centerId}</span>
                          </div>
                        )}
                        
                        {/* Hiển thị note nếu có */}
                        {appointment.note && (
                             <p className="mt-2 text-gray-500 italic text-xs">Ghi chú: {appointment.note}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Empty State
        <Card className="shadow-sm border-dashed border-2 border-gray-200 bg-gray-50/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HistoryIcon className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Chưa có lịch sử</h3>
            <p className="text-muted-foreground">
              Lịch sử dịch vụ sẽ hiển thị tại đây sau khi hoàn thành
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}