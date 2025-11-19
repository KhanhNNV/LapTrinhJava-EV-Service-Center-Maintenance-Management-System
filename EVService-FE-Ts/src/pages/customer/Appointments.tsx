import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCenters, CenterDto } from "@/services/appointmentService.ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Plus, Clock, MapPin, Loader2 } from "lucide-react";

// Import types và hooks
import {
  useCustomerVehicles,
  useCustomerAppointments,
  useBookAppointment,
  useServicePackages,
  useCancelAppointment,
  VehicleDto,
  ServicePackageDto,
  AppointmentDto,
} from "@/services/appointmentService.ts";

export default function Appointments() {
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const { data: centers } = useCenters();

  const [formData, setFormData] = useState({
    vehicleId: "",
    serviceType: "",
    appointmentDate: "",
    appointmentTime: "",
    note: "",
    centerId: "",
  });

  // Fetch Data
  const { data: vehicles, isLoading: isLoadingVehicles } =
    useCustomerVehicles();
  const { data: appointments, isLoading: isLoadingAppointments } =
    useCustomerAppointments();
  const { data: servicePackages, isLoading: isLoadingPackages } =
    useServicePackages();

  // Mutations
  const bookAppointmentMutation = useBookAppointment();
  const cancelAppointmentMutation = useCancelAppointment();

  // --- LOGIC LỌC DANH SÁCH ---
  // Tab này chỉ hiện các trạng thái đang xử lý.
  // Trạng thái COMPLETED và CANCELED (1 chữ L) sẽ hiển thị bên tab History.
  const activeAppointments =
    appointments?.filter(
      (a: AppointmentDto) => !["COMPLETED", "CANCELED"].includes(a.status)
    ) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    bookAppointmentMutation.mutate(formData, {
      onSuccess: () => {
        setIsBookingDialogOpen(false);
        setFormData({
          vehicleId: "",
          serviceType: "",
          appointmentDate: "",
          appointmentTime: "",
          note: "",
          centerId: "",
        });
      },
    });
  };

  const handleCancel = (appointmentId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này không?")) {
      cancelAppointmentMutation.mutate(appointmentId);
    }
  };

  // --- MAPPING MÀU SẮC TRẠNG THÁI (Khớp Java Enum) ---
  const getStatusColor = (status: string) => {
    const colors: any = {
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200", // Chờ xác nhận
      CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200", // Đã xác nhận
      CHECKED_IN: "bg-indigo-100 text-indigo-700 border-indigo-200", // Khách hàng đã đến
      ASSIGNED: "bg-cyan-100 text-cyan-700 border-cyan-200", // Đã phân công
      IN_PROGRESS: "bg-purple-100 text-purple-700 border-purple-200", // Đang thực hiện

      // Fallback cho history (nếu cần hiển thị ở đâu đó khác)
      CANCELED: "bg-red-100 text-red-700 border-red-200",
      COMPLETED: "bg-green-100 text-green-700 border-green-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  // --- MAPPING TEXT HIỂN THỊ (Khớp Java Enum) ---
  const getStatusText = (status: string) => {
    const texts: any = {
      PENDING: "Chờ xác nhận",
      CONFIRMED: "Đã xác nhận",
      CHECKED_IN: "Đã check-in",
      ASSIGNED: "Đã phân công cho nhân viên bảo dưỡng",
      IN_PROGRESS: "Đang bảo dưỡng",
      CANCELED: "Đã hủy",
      COMPLETED: "Hoàn thành",
    };
    return texts[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Lịch hẹn</h2>
          <p className="text-muted-foreground">
            Quản lý lịch hẹn bảo dưỡng của bạn
          </p>
        </div>

        {/* Button mở Dialog đặt lịch */}
        <Dialog
          open={isBookingDialogOpen}
          onOpenChange={setIsBookingDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="bg-[#007AFF] hover:bg-[#0066CC] shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4 mr-2" />
              Đặt lịch mới
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Đặt lịch hẹn</DialogTitle>
              <DialogDescription>
                Chọn xe và gói dịch vụ để đặt lịch bảo dưỡng
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                {/* Chọn xe - Load từ API */}
                <div className="space-y-2">
                  <Label>Chọn xe</Label>
                  <Select
                    value={formData.vehicleId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, vehicleId: value })
                    }
                    disabled={isLoadingVehicles}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingVehicles ? "Đang tải..." : "Chọn xe của bạn"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles && vehicles.length > 0 ? (
                        vehicles.map((v: VehicleDto) => (
                          <SelectItem
                            key={v.vehicleId}
                            value={v.vehicleId.toString()}
                          >
                            {v.model} - {v.licensePlate}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">
                          Bạn chưa đăng ký xe nào
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* YÊU CẦU: Thêm phần chọn trung tâm */}
                <div className="space-y-2">
                  <Label>Chọn trung tâm</Label>
                  <Select
                    onValueChange={(v) =>
                      setFormData({ ...formData, centerId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trung tâm" />
                    </SelectTrigger>
                    <SelectContent>
                      {centers?.map((c: CenterDto) => (
                        <SelectItem
                          key={c.centerId}
                          value={c.centerId.toString()}
                        >
                          {c.centerName} - {c.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* YÊU CẦU: Sửa loại dịch vụ */}
                <div className="space-y-2">
                  <Label>Loại dịch vụ</Label>
                  <Select
                    onValueChange={(v) =>
                      setFormData({ ...formData, serviceType: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn dịch vụ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bảo dưỡng tổng quát">
                        Bảo dưỡng tổng quát
                      </SelectItem>
                      <SelectItem value="Sửa chữa hư hỏng">
                        Sửa chữa hư hỏng
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ngày + Giờ */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ngày</Label>
                    <Input
                      type="date"
                      value={formData.appointmentDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          appointmentDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label>Giờ</Label>
                    <Input
                      type="time"
                      value={formData.appointmentTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          appointmentTime: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Ghi chú (Tùy chọn)</Label>
                  <Textarea
                    value={formData.note}
                    rows={3}
                    placeholder="Vd: Xe có tiếng kêu lạ..."
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-[#007AFF] hover:bg-[#0066CC]"
                  disabled={bookAppointmentMutation.isPending}
                >
                  {bookAppointmentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đặt lịch hẹn"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Danh sách lịch hẹn (Active only) */}
      {isLoadingAppointments ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-sm border-gray-100">
              <CardContent className="pt-6">
                <div className="h-24 bg-gray-100 animate-pulse rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : activeAppointments.length > 0 ? (
        <div className="space-y-4">
          {activeAppointments.map((appointment: AppointmentDto) => (
            <Card
              key={appointment.appointmentId}
              className="shadow-sm border-gray-100 hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon Calendar */}
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {appointment.serviceType}
                        </h3>

                        {/* Badge trạng thái */}
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {getStatusText(appointment.status)}
                        </span>
                      </div>

                      <div className="text-sm text-gray-500 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {appointment.appointmentTime} -{" "}
                            {new Date(
                              appointment.appointmentDate
                            ).toLocaleDateString("vi-VN")}
                          </span>
                        </div>

                        {appointment.centerId && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>Trung tâm số {appointment.centerId}</span>
                          </div>
                        )}

                        {appointment.note && (
                          <p className="mt-2 text-gray-600 italic">
                            "Note: {appointment.note}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nút Hủy chỉ hiện khi trạng thái là PENDING */}
                  {appointment.status === "PENDING" && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (confirm("Hủy lịch?"))
                          cancelAppointmentMutation.mutate(
                            appointment.appointmentId
                          );
                      }}
                    >
                      Hủy lịch
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-sm border-dashed border-2 border-gray-200 bg-gray-50/50">
          <CardContent className="py-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              Chưa có lịch hẹn nào
            </h3>
            <p className="text-muted-foreground mb-6">
              Hãy đặt lịch bảo dưỡng ngay để chăm sóc xe của bạn
            </p>
            <Button
              className="bg-[#007AFF] hover:bg-[#0066CC]"
              onClick={() => setIsBookingDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Đặt lịch ngay
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
