import { useState } from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from "@/components/ui/dialog";
import { History as HistoryIcon, Calendar, Clock, MapPin, Car, Eye, FileText, User, Wrench } from 'lucide-react'; // Import thêm icon

// Import hook lấy xe để mapping biển số và type AppointmentDto
import { 
    useCustomerAppointments, 
    useCustomerVehicles, 
    AppointmentDto, 
    VehicleDto 
} from '@/services/appointmentService.ts';

export default function History() {
  // 1. Lấy dữ liệu lịch hẹn
  const { data: appointments, isLoading } = useCustomerAppointments();
  
  // 2. Lấy dữ liệu xe để map ID -> Biển số
  const { data: vehicles } = useCustomerVehicles();

  // State để quản lý modal chi tiết
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDto | null>(null);

  // Logic lọc: Chỉ lấy COMPLETED và CANCELED
  const historyAppointments = appointments?.filter((a: AppointmentDto) => 
    ['COMPLETED', 'CANCELED'].includes(a.status)
  ) || [];

  // Helper: Tìm biển số xe từ ID
  const getLicensePlate = (vehicleId: number) => {
    const vehicle = vehicles?.find((v: VehicleDto) => v.vehicleId === vehicleId);
    return vehicle ? vehicle.licensePlate : `ID: ${vehicleId}`;
  };

  // Helper: Màu sắc trạng thái
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
                    {/* Icon */}
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
                        {/* SỬA: Hiển thị Biển số thay vì ID */}
                        <div className="flex items-center gap-2 font-medium text-blue-600">
                            <Car className="w-4 h-4" />
                            <span>Xe: {getLicensePlate(appointment.vehicleId)}</span>
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
                      </div>
                    </div>
                  </div>

                  {/* THÊM: Nút xem chi tiết */}
                  <Button variant="outline" size="sm" onClick={() => setSelectedAppointment(appointment)}>
                    <Eye className="w-4 h-4 mr-2"/> Chi tiết
                  </Button>
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

      {/* THÊM: Modal hiển thị chi tiết tất cả thuộc tính */}
      <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto custom-scrollbar pr-6">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600"/>
                    Chi tiết lịch hẹn #{selectedAppointment?.appointmentId}
                </DialogTitle>
                <DialogDescription>Thông tin đầy đủ về lịch sử dịch vụ</DialogDescription>
            </DialogHeader>
            
            {selectedAppointment && (
                <div className="grid grid-cols-1 gap-4 py-4 text-sm">
                    {/* Nhóm thông tin chính */}
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2 border border-gray-100">
                        <div className="font-semibold text-gray-900 mb-2">Thông tin chung</div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-gray-500 col-span-1">Mã lịch hẹn:</span>
                            <span className="col-span-2 font-medium">{selectedAppointment.appointmentId}</span>
                            
                            <span className="text-gray-500 col-span-1">Dịch vụ:</span>
                            <span className="col-span-2 font-medium">{selectedAppointment.serviceType}</span>
                            
                            <span className="text-gray-500 col-span-1">Trạng thái:</span>
                            <span className={`col-span-2 font-medium ${selectedAppointment.status === 'COMPLETED' ? 'text-green-600' : 'text-red-600'}`}>
                                {getStatusText(selectedAppointment.status)}
                            </span>

                            <span className="text-gray-500 col-span-1">Thời gian:</span>
                            <span className="col-span-2 font-medium">
                                {selectedAppointment.appointmentTime} - {new Date(selectedAppointment.appointmentDate).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                    </div>

                    {/* Nhóm thông tin xe & địa điểm */}
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2 border border-gray-100">
                         <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><Car className="w-4 h-4"/> Xe & Địa điểm</div>
                         <div className="grid grid-cols-3 gap-2">
                            <span className="text-gray-500 col-span-1">Biển số xe:</span>
                            <span className="col-span-2 font-medium text-blue-600">{getLicensePlate(selectedAppointment.vehicleId)}</span>
                            
                            <span className="text-gray-500 col-span-1">Mã xe (ID):</span>
                            <span className="col-span-2 text-gray-700">{selectedAppointment.vehicleId}</span>

                            <span className="text-gray-500 col-span-1">Trung tâm:</span>
                            <span className="col-span-2 text-gray-700">Center ID: {selectedAppointment.centerId}</span>
                         </div>
                    </div>

                    {/* Nhóm nhân sự (KTV, Staff) */}
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2 border border-gray-100">
                         <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><User className="w-4 h-4"/> Nhân sự phụ trách</div>
                         <div className="grid grid-cols-3 gap-2">
                            <span className="text-gray-500 col-span-1">Kỹ thuật viên:</span>
                            <span className="col-span-2 font-medium">
                                {selectedAppointment.technicianName ? selectedAppointment.technicianName : (
                                    <span className="text-gray-400 italic">Chưa cập nhật (ID: {selectedAppointment.technicianId || 'N/A'})</span>
                                )}
                            </span>

                            <span className="text-gray-500 col-span-1">Nhân viên:</span>
                            <span className="col-span-2 font-medium">
                                {selectedAppointment.staffName ? selectedAppointment.staffName : (
                                    <span className="text-gray-400 italic">Chưa cập nhật (ID: {selectedAppointment.staffId || 'N/A'})</span>
                                )}
                            </span>

                             <span className="text-gray-500 col-span-1">Khách hàng:</span>
                            <span className="col-span-2 font-medium">
                                {selectedAppointment.customerName ? selectedAppointment.customerName : (
                                    <span className="text-gray-400 italic">ID: {selectedAppointment.customerId}</span>
                                )}
                            </span>
                         </div>
                    </div>
                    
                    {/* Ghi chú & Khác */}
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2 border border-gray-100">
                         <div className="font-semibold text-gray-900 mb-2">Thông tin khác</div>
                         <div className="grid grid-cols-3 gap-2">
                            <span className="text-gray-500 col-span-1">Hợp đồng:</span>
                            <span className="col-span-2">{selectedAppointment.contractName || `ID: ${selectedAppointment.contractId || 'N/A'}`}</span>

                            <span className="text-gray-500 col-span-1">Ghi chú:</span>
                            <span className="col-span-2 italic text-gray-600">{selectedAppointment.note || "Không có ghi chú"}</span>

                            <span className="text-gray-500 col-span-1">Ngày tạo:</span>
                            <span className="col-span-2 text-xs text-gray-500">
                                {selectedAppointment.createdAt ? new Date(selectedAppointment.createdAt).toLocaleString('vi-VN') : 'N/A'}
                            </span>

                            <span className="text-gray-500 col-span-1">Cập nhật:</span>
                            <span className="col-span-2 text-xs text-gray-500">
                                {selectedAppointment.updatedAt ? new Date(selectedAppointment.updatedAt).toLocaleString('vi-VN') : 'N/A'}
                            </span>
                         </div>
                    </div>

                </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}