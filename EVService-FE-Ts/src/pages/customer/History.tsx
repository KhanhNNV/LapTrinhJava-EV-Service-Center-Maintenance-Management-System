import { useState } from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCenters, CenterDto } from '@/services/appointmentService.ts';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from "@/components/ui/dialog";
import { 
  History as HistoryIcon, 
  Calendar, 
  Clock, 
  MapPin, 
  Car, 
  Eye, 
  FileText, 
  User, 
  Filter,
  ArrowUpDown
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import hook lấy xe để mapping biển số và type AppointmentDto
import { 
    useCustomerAppointments, 
    useCustomerVehicles, 
    AppointmentDto, 
    VehicleDto 
} from '@/services/appointmentService.ts';
import { useServicePackages, ServicePackageDto } from '@/services/appointmentService.ts';

export default function History() {
  // 1. Lấy dữ liệu lịch hẹn
  const { data: appointments, isLoading } = useCustomerAppointments();
  
  // 2. Lấy dữ liệu xe để map ID -> Biển số
  const { data: vehicles } = useCustomerVehicles();

  const { data: centers } = useCenters();

  const { data: servicePackages } = useServicePackages();

  // State để quản lý modal chi tiết
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDto | null>(null);

  // State cho sorting và filtering
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Logic lọc: Chỉ lấy COMPLETED và CANCELED
  const historyAppointments = appointments?.filter((a: AppointmentDto) => 
    ['COMPLETED', 'CANCELED'].includes(a.status)
  ) || [];

  // --- LOGIC SẮP XẾP VÀ LỌC ---
  const filteredAndSortedAppointments = historyAppointments
    .filter((appointment: AppointmentDto) => {
      if (statusFilter === "ALL") return true;
      return appointment.status === statusFilter;
    })
    .sort((a: AppointmentDto, b: AppointmentDto) => {
      const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
      const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
      
      if (sortOrder === "newest") {
        return dateB.getTime() - dateA.getTime(); // Mới nhất đầu tiên
      } else {
        return dateA.getTime() - dateB.getTime(); // Cũ nhất đầu tiên
      }
    });

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

  // Thêm helper function để lấy description từ serviceType
const getServiceDescription = (serviceType: string) => {
  const servicePackage = servicePackages?.find(pkg => pkg.packageName === serviceType);
  return servicePackage?.description || serviceType; // Fallback về serviceType nếu không tìm thấy
};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Lịch sử dịch vụ</h2>
        <p className="text-muted-foreground">
          Xem lại các lịch hẹn đã hoàn thành hoặc đã hủy
        </p>
      </div>

      {/* Bộ lọc và sắp xếp */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Lọc theo:</span>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Bộ lọc trạng thái */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
              <SelectItem value="CANCELED">Đã hủy</SelectItem>
            </SelectContent>
          </Select>

          {/* Sắp xếp thời gian */}
          <Select value={sortOrder} onValueChange={(value: "newest" | "oldest") => setSortOrder(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất đầu tiên</SelectItem>
              <SelectItem value="oldest">Cũ nhất đầu tiên</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
      ) : filteredAndSortedAppointments.length > 0 ? (
        // List Lịch sử
        <div className="space-y-4">
          {filteredAndSortedAppointments.map((appointment: AppointmentDto) => (
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
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              {statusFilter === "ALL" ? "Chưa có lịch sử" : "Không tìm thấy lịch sử phù hợp"}
            </h3>
            <p className="text-muted-foreground">
              {statusFilter === "ALL" 
                ? "Lịch sử dịch vụ sẽ hiển thị tại đây sau khi hoàn thành"
                : "Thử thay đổi bộ lọc trạng thái để xem kết quả khác"
              }
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
        <span className="col-span-2 font-medium">
          {getServiceDescription(selectedAppointment.serviceType)}
        </span>
        
        <span className="text-gray-500 col-span-1">Trạng thái:</span>
        <span className={`col-span-2 font-medium ${selectedAppointment.status === 'COMPLETED' ? 'text-green-600' : 'text-red-600'}`}>
          {getStatusText(selectedAppointment.status)}
        </span>

        <span className="text-gray-500 col-span-1">Thời gian:</span>
        <span className="col-span-2 font-medium">
          {selectedAppointment.appointmentTime} - {new Date(selectedAppointment.appointmentDate).toLocaleDateString('vi-VN')}
        </span>

        {/* THÊM: Tên trung tâm dịch vụ */}
        <span className="text-gray-500 col-span-1">Trung tâm:</span>
        <span className="col-span-2 font-medium">
          {centers?.find(c => c.centerId === selectedAppointment.centerId)?.centerName || `Center ID: ${selectedAppointment.centerId}`}
        </span>
      </div>
    </div>

    {/* SỬA: Nhóm thông tin xe */}
    <div className="bg-gray-50 p-3 rounded-lg space-y-2 border border-gray-100">
      <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><Car className="w-4 h-4"/> Thông tin xe</div>
      <div className="grid grid-cols-3 gap-2">
        <span className="text-gray-500 col-span-1">Biển số xe:</span>
        <span className="col-span-2 font-medium text-blue-600">{getLicensePlate(selectedAppointment.vehicleId)}</span>
        
        {/* THÊM: Hãng xe */}
        <span className="text-gray-500 col-span-1">Hãng xe:</span>
        <span className="col-span-2 text-gray-700">
          {vehicles?.find(v => v.vehicleId === selectedAppointment.vehicleId)?.brand || "N/A"}
        </span>

        {/* THÊM: Ghi chú */}
        <span className="text-gray-500 col-span-1">Ghi chú:</span>
        <span className="col-span-2 italic text-gray-600">
          {selectedAppointment.note || "Không có ghi chú kèm theo"}
        </span>
      </div>
    </div>

    {/* SỬA: Nhóm nhân sự - BỎ DÒNG KHÁCH HÀNG */}
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

        {/* BỎ: Dòng khách hàng */}
      </div>
    </div>
    
    {/* SỬA: Thông tin khác - BỎ DÒNG HỢP ĐỒNG */}
    <div className="bg-gray-50 p-3 rounded-lg space-y-2 border border-gray-100">
      <div className="font-semibold text-gray-900 mb-2">Thông tin khác</div>
      <div className="grid grid-cols-3 gap-2">
        {/* BỎ: Dòng hợp đồng */}

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