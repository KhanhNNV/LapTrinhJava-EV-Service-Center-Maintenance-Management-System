import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/services/api";
import { toast } from "sonner";
import {
  Calendar,
  User,
  Clock,
  Wrench,
  CheckCircle,
  CarFront,
  PlayCircle,
  CheckSquare,
  XCircle,
  Filter,
  RotateCcw,
  Phone,
  FileText,
  MapPin,
  Car,
  Loader2,
} from "lucide-react";
import { getErrorMessage } from "@/utils/error";

// 1. Cập nhật Interface
interface Vehicle {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
}

interface Appointment {
  appointmentId: number;
  appointmentDate: string;
  appointmentTime: string;
  ticketId?: number; // ID phiếu sửa chữa nếu có
  serviceType: string;
  status: string;
  note?: string;
  customerId: number; // Cần field này để gọi API lấy xe
  customerName: string;
  phoneNumber?: string;
  technicianId?: number;
  technicianName?: string;
  contractName?: string | null;
  vehicleId?: number; // ID xe trong lịch hẹn
  vehicle?: Vehicle; // Object xe nếu DTO trả về sẵn
  serviceCenter?: {
    name: string;
    address: string;
  };
}

interface Technician {
  userId: number;
  fullName: string;
  phoneNumber?: string;
  expiryDate?: string;
}

interface ColumnDefinition {
  id: string;
  title: string;
  color: string;
  statuses: string[];
  icon: any;
}

export default function StaffAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [suggestedTechnicians, setSuggestedTechnicians] = useState<
    Technician[]
  >([]);

  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    number | null
  >(null);
  const [selectedTechnician, setSelectedTechnician] = useState<number | null>(
    null
  );
  const [createdInvoices, setCreatedInvoices] = useState<Set<number>>(
    new Set()
  );

  // State xem chi tiết
  const [viewingAppointment, setViewingAppointment] =
    useState<Appointment | null>(null);
  const [customerVehicles, setCustomerVehicles] = useState<Vehicle[]>([]); // Danh sách xe của khách
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus]);

  const fetchAppointments = async () => {
    try {
      let url = "/api/appointments";
      if (filterStatus !== "ALL") {
        url = `/api/appointments/status/${filterStatus}`;
      }
      const { data } = await api.get<Appointment[]>(url);
      setAppointments(data);
    } catch (err) {
      console.error(getErrorMessage(err));
      toast.error("Không tải được danh sách lịch hẹn");
    }
  };

  // 2. Hàm mới: Lấy danh sách xe khi xem chi tiết
  const handleViewDetails = async (apt: Appointment) => {
    setViewingAppointment(apt);
    setCustomerVehicles([]); // Reset trước khi tải

    if (apt.customerId) {
      setLoadingVehicles(true);
      try {
        const res = await api.get<Vehicle[]>(
          `/api/vehicles/customer/${apt.customerId}`
        );
        setCustomerVehicles(res.data);
      } catch (error) {
        console.error("Failed to fetch vehicles", error);
        // Không toast error ở đây để tránh làm phiền nếu chỉ là lỗi phụ
      } finally {
        setLoadingVehicles(false);
      }
    }
  };

  const fetchSuggestedTechnicians = async (appointmentId: number) => {
    setLoadingSuggestions(true);
    try {
      const { data } = await api.get<Technician[]>(
        `/api/appointments/${appointmentId}/suggestedTechnicians`
      );
      setSuggestedTechnicians(data);
    } catch (err) {
      toast.error("Không tải được danh sách kỹ thuật viên");
      setSuggestedTechnicians([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const confirmAppointment = async (id: number) => {
    try {
      await api.put(`/api/appointments/${id}/confirmForCustomer`);
      toast.success("Đã xác nhận lịch hẹn");
      fetchAppointments();
      if (viewingAppointment?.appointmentId === id) setViewingAppointment(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Xác nhận thất bại");
    }
  };

  const checkInAppointment = async (id: number) => {
    try {
      await api.put(`/api/appointments/${id}/check-in`);
      toast.success("Đã nhận xe thành công");
      fetchAppointments();
      if (viewingAppointment?.appointmentId === id) setViewingAppointment(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Check-in thất bại");
    }
  };

  const assignTechnician = async () => {
    if (!selectedTechnician || Number.isNaN(selectedTechnician)) {
      toast.error("Vui lòng chọn kỹ thuật viên");
      return;
    }

    try {
      const { data } = await api.put<Appointment>(
        `/api/appointments/${selectedAppointmentId}/assignTechnician`,
        { technicianId: selectedTechnician }
      );

      toast.success(`Đã phân công cho ${data.technicianName}`);

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.appointmentId === selectedAppointmentId
            ? { ...apt, ...data }
            : apt
        )
      );

      setSelectedAppointmentId(null);
      setSelectedTechnician(null);
      setSuggestedTechnicians([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Phân công thất bại");
    }
  };

  const createInvoice = async (appointmentId: number) => {
    try {
      await api.post(`/api/invoices/${viewingAppointment.ticketId}`);

      toast.success("Đã tạo hóa đơn thành công!");

      // Đánh dấu đã tạo, không cho tạo lại
      setCreatedInvoices((prev) => new Set(prev).add(appointmentId));

      // Optional: reload lại appointment để cập nhật trạng thái nếu backend có field invoiceId
      fetchAppointments();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Tạo hóa đơn thất bại. Có thể đã tồn tại hoặc chưa có phiếu sửa chữa."
      );
    }
  };

  // --- Helper Functions ---
  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-yellow-500 hover:bg-yellow-500",
      CONFIRMED: "bg-blue-500 hover:bg-blue-500",
      CHECKED_IN: "bg-orange-500 hover:bg-orange-500",
      ASSIGNED: "bg-indigo-500 hover:bg-indigo-500",
      IN_PROGRESS: "bg-blue-600 hover:bg-blue-600",
      COMPLETED: "bg-green-600 hover:bg-green-600",
      CANCELLED: "bg-red-600 hover:bg-red-600",
    };
    const labels = {
      PENDING: "Chờ xác nhận",
      CONFIRMED: "Đã xác nhận",
      CHECKED_IN: "Đã nhận xe",
      ASSIGNED: "Đã giao KTV",
      IN_PROGRESS: "Đang thực hiện",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
    };
    // @ts-ignore
    return (
      <Badge className={styles[status] || ""}>{labels[status] || status}</Badge>
    );
  };

  const columns: ColumnDefinition[] = [
    {
      id: "pending",
      title: "Chờ xử lý",
      color: "bg-yellow-500",
      statuses: ["PENDING"],
      icon: Clock,
    },
    {
      id: "confirmed",
      title: "Đã xác nhận",
      color: "bg-blue-500",
      statuses: ["CONFIRMED"],
      icon: CheckCircle,
    },
    {
      id: "checkin_assigned",
      title: "Nhận xe & Giao Tech",
      color: "bg-orange-500",
      statuses: ["CHECKED_IN", "ASSIGNED"],
      icon: User,
    },
    {
      id: "end_state",
      title: "Kết thúc (Hoàn thành/Hủy)",
      color: "bg-green-500",
      statuses: ["IN_PROGRESS", "COMPLETED", "CANCELLED"],
      icon: CheckSquare,
    },
  ];

  const filterOptions = [
    { value: "ALL", label: "Tất cả trạng thái" },
    { value: "PENDING", label: "Chờ xác nhận (Pending)" },
    { value: "CONFIRMED", label: "Đã xác nhận (Confirmed)" },
    { value: "CHECKED_IN", label: "Đã nhận xe (Checked In)" },
    { value: "ASSIGNED", label: "Đã giao KTV (Assigned)" },
    { value: "IN_PROGRESS", label: "Đang thực hiện (In Progress)" },
    { value: "COMPLETED", label: "Hoàn thành (Completed)" },
    { value: "CANCELLED", label: "Đã hủy (Cancelled)" },
  ];

  const getColumnItems = (statuses: string[]) => {
    return appointments.filter((a) => statuses.includes(a.status));
  };

  return (
    <div className="space-y-6 p-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Quản lý lịch hẹn
          </h2>
          <p className="text-muted-foreground">
            Theo dõi quy trình từ đặt lịch đến khi hoàn thành
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-card border rounded-md px-3 py-1 shadow-sm">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[220px] border-none shadow-none h-8 focus:ring-0">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {filterStatus !== "ALL" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFilterStatus("ALL")}
              title="Xóa bộ lọc"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full overflow-hidden">
        {columns.map((col) => {
          const items = getColumnItems(col.statuses);
          const Icon = col.icon;

          return (
            <div
              key={col.id}
              className="flex flex-col h-full bg-muted/30 rounded-xl border overflow-hidden"
            >
              <div className="p-4 border-b bg-card flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 font-semibold">
                  <div className={`p-1.5 rounded-md text-white ${col.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm">{col.title}</span>
                </div>
                <Badge variant="outline" className="font-mono">
                  {items.length}
                </Badge>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {items.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg opacity-50">
                    Trống
                  </div>
                ) : (
                  items.map((apt) => (
                    <Card
                      key={apt.appointmentId}
                      onClick={() => handleViewDetails(apt)}
                      className="shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 group relative"
                      style={{
                        borderLeftColor:
                          apt.status === "COMPLETED"
                            ? "#22c55e"
                            : apt.status === "CANCELLED"
                            ? "#ef4444"
                            : apt.status === "IN_PROGRESS"
                            ? "#3b82f6"
                            : apt.status === "ASSIGNED"
                            ? "#f97316"
                            : "transparent",
                      }}
                    >
                      <CardHeader className="p-3 pb-0">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className="text-[10px]">
                            #{apt.appointmentId}
                          </Badge>
                          <span className="text-xs font-semibold text-primary uppercase truncate max-w-[120px]">
                            {apt.serviceType}
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="p-3 pt-2 space-y-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="truncate">{apt.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {apt.appointmentDate} - {apt.appointmentTime}
                            </span>
                          </div>
                        </div>

                        {apt.technicianName && (
                          <div className="flex items-center gap-2 text-xs bg-primary/5 p-1.5 rounded text-primary font-medium">
                            <Wrench className="h-3 w-3" />
                            <span>Tech: {apt.technicianName}</span>
                          </div>
                        )}

                        <div
                          className="pt-2 mt-1 border-t"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {apt.status === "PENDING" && (
                            <Button
                              className="w-full h-8 text-xs"
                              onClick={() =>
                                confirmAppointment(apt.appointmentId)
                              }
                            >
                              <CheckCircle className="h-3 w-3 mr-1.5" />
                              Xác nhận
                            </Button>
                          )}

                          {apt.status === "CONFIRMED" && (
                            <Button
                              className="w-full h-8 text-xs"
                              variant="secondary"
                              onClick={() =>
                                checkInAppointment(apt.appointmentId)
                              }
                            >
                              <CarFront className="h-3 w-3 mr-1.5" />
                              Check-in
                            </Button>
                          )}

                          {col.id === "checkin_assigned" && (
                            <>
                              {apt.status === "CHECKED_IN" ? (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      className="w-full h-8 text-xs bg-orange-500 hover:bg-orange-600 text-white"
                                      onClick={() => {
                                        setSelectedAppointmentId(
                                          apt.appointmentId
                                        );
                                        setSelectedTechnician(null);
                                        fetchSuggestedTechnicians(
                                          apt.appointmentId
                                        );
                                      }}
                                    >
                                      <User className="h-3 w-3 mr-1.5" />
                                      Phân công KTV
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <DialogHeader>
                                      <DialogTitle>
                                        Phân công kỹ thuật viên
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      {loadingSuggestions ? (
                                        <p className="text-center text-sm text-muted-foreground">
                                          Đang tải danh sách KTV...
                                        </p>
                                      ) : suggestedTechnicians.length > 0 ? (
                                        <>
                                          <Select
                                            onValueChange={(val) =>
                                              setSelectedTechnician(Number(val))
                                            }
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Chọn KTV phù hợp" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {suggestedTechnicians.map((t) => (
                                                <SelectItem
                                                  key={t.userId}
                                                  value={String(t.userId)}
                                                >
                                                  {t.fullName}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <Button
                                            onClick={assignTechnician}
                                            disabled={!selectedTechnician}
                                            className="w-full"
                                          >
                                            Xác nhận phân công
                                          </Button>
                                        </>
                                      ) : (
                                        <p className="text-center text-destructive text-sm">
                                          Không tìm thấy KTV phù hợp
                                        </p>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              ) : (
                                <div className="w-full h-8 flex items-center justify-center text-xs text-muted-foreground bg-muted rounded border border-dashed">
                                  Chờ KTV bắt đầu
                                </div>
                              )}
                            </>
                          )}

                          {col.id === "end_state" && (
                            <div className="text-center">
                              {apt.status === "IN_PROGRESS" && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-50"
                                >
                                  <PlayCircle className="w-3 h-3 mr-1" />
                                  Đang thực hiện
                                </Badge>
                              )}
                              {apt.status === "COMPLETED" && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Hoàn thành
                                </Badge>
                              )}
                              {apt.status === "CANCELLED" && (
                                <Badge
                                  variant="outline"
                                  className="bg-red-50 text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Đã hủy
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        open={!!viewingAppointment}
        onOpenChange={(open) => !open && setViewingAppointment(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <span>
                Chi tiết lịch hẹn #{viewingAppointment?.appointmentId}
              </span>
              {viewingAppointment && getStatusBadge(viewingAppointment.status)}
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về khách hàng, xe và dịch vụ
            </DialogDescription>
          </DialogHeader>

          {viewingAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" /> Khách hàng
                  </h4>
                  <p className="font-medium">
                    {viewingAppointment.customerName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {viewingAppointment.phoneNumber || "Không có SĐT"}
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Car className="w-4 h-4" /> Thông tin xe
                  </h4>
                  {/* 3. Cập nhật hiển thị xe: Ưu tiên xe trong Appointment, nếu không thì tìm trong danh sách xe của khách */}
                  {(() => {
                    // Tìm xe được chọn trong lịch hẹn
                    const selectedVehicle =
                      viewingAppointment.vehicle ||
                      customerVehicles.find(
                        (v) => v.id === viewingAppointment.vehicleId
                      );

                    if (selectedVehicle) {
                      return (
                        <>
                          <p className="font-medium">
                            {selectedVehicle.brand} {selectedVehicle.model}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            BKS: {selectedVehicle.licensePlate}
                          </p>
                        </>
                      );
                    } else if (loadingVehicles) {
                      return (
                        <p className="text-sm text-muted-foreground italic flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Đang
                          tải...
                        </p>
                      );
                    } else if (customerVehicles.length > 0) {
                      // Nếu không xác định được xe cụ thể trong lịch hẹn, hiển thị xe đầu tiên của khách (fallback)
                      const firstCar = customerVehicles[0];
                      return (
                        <>
                          <p className="font-medium">
                            {firstCar.brand} {firstCar.model}{" "}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            BKS: {firstCar.licensePlate}
                          </p>
                        </>
                      );
                    } else {
                      return (
                        <p className="text-sm text-muted-foreground italic">
                          Chưa cập nhật xe
                        </p>
                      );
                    }
                  })()}
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Wrench className="w-4 h-4" /> Dịch vụ
                  </h4>
                  <p className="font-medium">
                    {viewingAppointment.serviceType}
                  </p>
                  {viewingAppointment.contractName && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      Gói: {viewingAppointment.contractName}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Thời gian
                  </h4>
                  <p className="font-medium">
                    {viewingAppointment.appointmentDate}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {viewingAppointment.appointmentTime}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" /> Kỹ thuật viên
                  </h4>
                  <p className="font-medium">
                    {viewingAppointment.technicianName || "Chưa phân công"}
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Địa điểm
                  </h4>
                  <p className="text-sm font-medium">
                    {viewingAppointment.serviceCenter
                      ? viewingAppointment.serviceCenter.name
                      : "Trung tâm chính"}
                  </p>
                </div>
              </div>

              {viewingAppointment.note && (
                <div className="bg-muted/50 p-3 rounded-md space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Ghi chú của khách hàng
                  </h4>
                  <p className="text-sm italic">"{viewingAppointment.note}"</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setViewingAppointment(null)}
            >
              Đóng
            </Button>

            {/* Nút Xác nhận (Pending) */}
            {viewingAppointment?.status === "PENDING" && (
              <Button
                onClick={() =>
                  confirmAppointment(viewingAppointment.appointmentId)
                }
              >
                Xác nhận lịch hẹn
              </Button>
            )}

            {/* Nút TẠO HÓA ĐƠN - chỉ hiện khi COMPLETED */}
            {viewingAppointment?.status === "COMPLETED" && (
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => createInvoice(viewingAppointment.appointmentId)}
                disabled={createdInvoices.has(viewingAppointment.appointmentId)}
              >
                <FileText className="w-4 h-4 mr-2" />
                {createdInvoices.has(viewingAppointment.ticketId)
                  ? "Đã tạo hóa đơn"
                  : "Tạo hóa đơn"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
