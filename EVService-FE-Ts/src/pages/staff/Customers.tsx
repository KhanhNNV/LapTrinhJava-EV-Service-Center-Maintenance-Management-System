import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Bike } from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/common/PaginationControls";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { toast } from "sonner";
import {
  Search,
  Mail,
  Phone,
  Edit,
  User,
  Calendar,
  Loader2,
  MapPin,
  RefreshCw,
} from "lucide-react";

// --- INTERFACES ---

// 1. Appointment khớp với DTO Backend
interface Appointment {
  appointmentId: number;
  appointmentDate: string;
  appointmentTime: string;
  serviceType: string;
  status: string;

  customerId: number;
  customerName: string;
  phoneNumber: string; // Dữ liệu này sẽ dùng để hiển thị ra ngoài ngay lập tức

  vehicleId?: number;
  staffId?: number;
}

// 2. Customer Summary cho danh sách bên ngoài
interface CustomerSummary {
  id: number; // Thống nhất dùng 'id' làm key chính
  fullName: string;
  phoneNumber: string;
  lastAppointmentDate?: string;
}

// 3. Customer Detail cho Dialog (linh hoạt ID)
interface CustomerDetail {
  id?: number; // Backend thường trả về cái này
  userId?: number; // Dự phòng nếu backend trả về cái này
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address?: string;
  role?: string;
}

interface Vehicle {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
}

export default function StaffCustomers() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingList, setLoadingList] = useState(false);

  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerDetail | null>(null);
  const [customerAppointments, setCustomerAppointments] = useState<
    Appointment[]
  >([]);
  const [customerVehicles, setCustomerVehicles] = useState<Vehicle[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    address: "",
  });

    const {
        currentData,
        currentPage,
        totalPages,
        goToPage,
        totalItems,
        indexOfFirstItem,
        indexOfLastItem
    } = usePagination(customers, 12);

  useEffect(() => {
    fetchCustomersFromAppointments();
  }, []);

  // --- 1. FIX: LOGIC LẤY SĐT NGAY TỪ ĐẦU ---
  const fetchCustomersFromAppointments = async () => {
    setLoadingList(true);
    try {
      const response = await api.get<Appointment[]>("/api/appointments");
      const appointments = response.data;

      const uniqueMap = new Map<number, CustomerSummary>();

      appointments.forEach((app) => {
        if (!app.customerId) return;

        const existingCustomer = uniqueMap.get(app.customerId);

        // Nếu chưa có trong Map -> Thêm mới
        if (!existingCustomer) {
          uniqueMap.set(app.customerId, {
            id: app.customerId, // Lưu customerId vào trường id
            fullName: app.customerName || "Khách hàng",
            phoneNumber: app.phoneNumber || "", // Lấy SĐT từ lịch hẹn
            lastAppointmentDate: app.appointmentDate,
          });
        } else {
          // Nếu đã có -> Cập nhật thông tin nếu bản ghi này tốt hơn
          let shouldUpdate = false;

          // UPDATE 1: Nếu trong Map chưa có SĐT mà lịch hẹn này CÓ -> Cập nhật ngay
          if (!existingCustomer.phoneNumber && app.phoneNumber) {
            existingCustomer.phoneNumber = app.phoneNumber;
            shouldUpdate = true;
          }

          // UPDATE 2: Cập nhật ngày hẹn gần nhất
          if (
            app.appointmentDate > (existingCustomer.lastAppointmentDate || "")
          ) {
            existingCustomer.lastAppointmentDate = app.appointmentDate;
            shouldUpdate = true;
          }

          if (shouldUpdate) {
            uniqueMap.set(app.customerId, existingCustomer);
          }
        }
      });

      setCustomers(Array.from(uniqueMap.values()));
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
      toast.error("Không thể tải dữ liệu khách hàng");
    } finally {
      setLoadingList(false);
    }
  };

  const fetchCustomerDetails = async (customerId: number) => {
    setIsLoadingDetails(true);
    setSelectedCustomer(null);

    try {
      const [userRes, appRes, vehicleRes] = await Promise.all([
        api.get<CustomerDetail>(`/api/users/${customerId}`),
        api.get<Appointment[]>("/api/appointments"),
        api
          .get<Vehicle[]>(`/api/vehicles/customer/${customerId}`)
          .catch(() => ({ data: [] })), // Catch lỗi nếu API xe chưa có
      ]);

      const userData = userRes.data;
      setSelectedCustomer(userData);

      // Đồng bộ ngược lại danh sách bên ngoài (đề phòng API User có SĐT mới hơn API Appointment)
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId
            ? {
                ...c,
                fullName: userData.fullName,
                phoneNumber: userData.phoneNumber || c.phoneNumber,
              }
            : c
        )
      );

      // Lọc lịch hẹn
      const userApps = appRes.data.filter((a) => a.customerId === customerId);
      userApps.sort(
        (a, b) =>
          new Date(b.appointmentDate).getTime() -
          new Date(a.appointmentDate).getTime()
      );
      setCustomerAppointments(userApps);

      // Xe
      setCustomerVehicles(vehicleRes.data || []);

      // Fill form edit
      setEditForm({
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber || "",
        email: userData.email,
        address: userData.address || "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải thông tin chi tiết");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // --- 2. FIX: LỖI UPDATE UNDEFINED ---
  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return;

    // QUAN TRỌNG: Kiểm tra cả id và userId
    // Backend UserDto thường trả về 'id', nhưng nếu bạn dùng DTO tùy chỉnh có thể là 'userId'
    const targetId = selectedCustomer.id ?? selectedCustomer.userId;

    if (!targetId) {
      console.error("Selected Customer Data:", selectedCustomer); // Log để debug
      toast.error("Lỗi: Không tìm thấy ID người dùng (undefined)");
      return;
    }

    try {
      const payload = {
        ...selectedCustomer, // Giữ lại các trường cũ (username, password, roles...) để tránh lỗi 400 thiếu field
        ...editForm, // Ghi đè thông tin mới
        role: "CUSTOMER", // Đảm bảo role không bị null
      };

      await api.put(`/api/users/${targetId}`, payload);

      toast.success("Cập nhật thành công");
      setIsEditing(false);

      // Cập nhật state hiển thị
      setSelectedCustomer({ ...selectedCustomer, ...editForm });

      // Cập nhật danh sách bên ngoài
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === targetId
            ? {
                ...c,
                fullName: editForm.fullName,
                phoneNumber: editForm.phoneNumber,
              }
            : c
        )
      );
    } catch (error: any) {
      const msg =
        error.response?.data?.message || "Vui lòng kiểm tra lại dữ liệu";
      toast.error(`Cập nhật thất bại: ${msg}`);
    }
  };

  const filteredCustomers = currentData.filter(
    (c) =>
      c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phoneNumber && c.phoneNumber.includes(searchTerm))
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Khách hàng</h2>
        <p className="text-muted-foreground">
          Quản lý thông tin khách hàng (tổng hợp từ lịch hẹn)
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên hoặc SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={fetchCustomersFromAppointments}
          size="icon"
          title="Làm mới danh sách"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {loadingList ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
          <>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <Card
                key={customer.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3 shrink-0">
                      {customer.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <CardTitle className="text-base font-semibold truncate">
                        {customer.fullName}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        ID: {customer.id}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm pt-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {/* SĐT hiển thị ngay từ đầu */}
                    <span>{customer.phoneNumber || "Chưa có SĐT"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Gần nhất: {customer.lastAppointmentDate || "N/A"}
                    </span>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="secondary"
                        className="w-full mt-2"
                        onClick={() => fetchCustomerDetails(customer.id)}
                      >
                        Xem Hồ Sơ
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <div className="flex items-center justify-between pr-8">
                          <DialogTitle className="text-xl">
                            Hồ sơ khách hàng
                          </DialogTitle>
                          {!isEditing ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsEditing(true)}
                            >
                              <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
                            </Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditing(false)}
                              >
                                Hủy
                              </Button>
                              <Button size="sm" onClick={handleUpdateCustomer}>
                                Lưu
                              </Button>
                            </div>
                          )}
                        </div>
                        <DialogDescription>
                          Thông tin chi tiết và lịch sử dịch vụ
                        </DialogDescription>
                      </DialogHeader>

                      {isLoadingDetails ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : (
                        selectedCustomer && (
                          <div className="space-y-6 py-2">
                            {/* FORM THÔNG TIN */}
                            <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/40 rounded-lg border">
                              <div className="space-y-2">
                                <Label>Họ và tên</Label>
                                {isEditing ? (
                                  <Input
                                    value={editForm.fullName}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        fullName: e.target.value,
                                      })
                                    }
                                  />
                                ) : (
                                  <div className="font-medium flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    {selectedCustomer.fullName}
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label>Số điện thoại</Label>
                                {isEditing ? (
                                  <Input
                                    value={editForm.phoneNumber}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        phoneNumber: e.target.value,
                                      })
                                    }
                                  />
                                ) : (
                                  <div className="font-medium flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    {selectedCustomer.phoneNumber || "---"}
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label>Email</Label>
                                {isEditing ? (
                                  <Input
                                    value={editForm.email}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        email: e.target.value,
                                      })
                                    }
                                  />
                                ) : (
                                  <div className="font-medium flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    {selectedCustomer.email}
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label>Địa chỉ</Label>
                                {isEditing ? (
                                  <Input
                                    value={editForm.address}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        address: e.target.value,
                                      })
                                    }
                                  />
                                ) : (
                                  <div className="font-medium flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    {selectedCustomer.address ||
                                      "Chưa cập nhật"}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* DANH SÁCH XE */}
                            <div>
                              <h4 className="text-base font-semibold mb-3 flex items-center gap-2">
                                <Car className="h-5 w-5 text-blue-500" />
                                Phương tiện ({customerVehicles.length})
                              </h4>
                              {customerVehicles.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {customerVehicles.map((car) => (
                                    <div
                                      key={car.id}
                                      className="p-3 border rounded-lg bg-slate-50 flex flex-col gap-2 hover:bg-slate-100 transition-colors"
                                    >
                                      <div className="font-bold text-sm flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                          {/* Icon xe thêm vào đây */}
                                          <div className="p-1.5 bg-white rounded-full border shadow-sm">
                                            <Car className="h-4 w-4 text-primary" />
                                          </div>
                                          <span>
                                            {car.brand} {car.model}
                                          </span>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className="bg-white whitespace-nowrap ml-2"
                                        >
                                          {car.year}
                                        </Badge>
                                      </div>
                                      <div className="pl-9">
                                        {" "}
                                        {/* Căn lề để thẳng hàng với tên xe */}
                                        <div className="text-xs text-muted-foreground">
                                          BKS:{" "}
                                          <span className="font-medium text-foreground">
                                            {car.licensePlate}
                                          </span>
                                        </div>
                                        {car.color && (
                                          <div className="text-xs text-muted-foreground mt-0.5">
                                            Màu: {car.color}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm text-muted-foreground italic p-3 border rounded-md bg-slate-50 text-center">
                                  Chưa có xe nào.
                                </div>
                              )}
                            </div>

                            {/* LỊCH SỬ DỊCH VỤ */}
                            <div>
                              <h4 className="text-base font-semibold mb-3 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-orange-500" />
                                Lịch sử dịch vụ ({customerAppointments.length})
                              </h4>

                              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                                {customerAppointments.length > 0 ? (
                                  customerAppointments.map((app) => {
                                    // Logic màu sắc cho trạng thái
                                    let badgeClass =
                                      "border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-100"; // Default

                                    switch (app.status) {
                                      case "COMPLETED":
                                        badgeClass =
                                          "border-green-200 bg-green-100 text-green-700 hover:bg-green-100";
                                        break;
                                      case "CANCELLED":
                                        badgeClass =
                                          "border-red-200 bg-red-100 text-red-700 hover:bg-red-100";
                                        break;
                                      case "IN_PROGRESS":
                                        badgeClass =
                                          "border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100";
                                        break;
                                      case "CONFIRMED":
                                        badgeClass =
                                          "border-sky-200 bg-sky-100 text-sky-700 hover:bg-sky-100";
                                        break;
                                      case "PENDING":
                                        badgeClass =
                                          "border-yellow-200 bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
                                        break;
                                      case "CHECKED_IN":
                                      case "ASSIGNED":
                                        badgeClass =
                                          "border-orange-200 bg-orange-100 text-orange-700 hover:bg-orange-100";
                                        break;
                                    }

                                    return (
                                      <div
                                        key={app.appointmentId}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg bg-white shadow-sm hover:bg-slate-50 transition-colors"
                                      >
                                        <div className="space-y-1">
                                          <div className="font-semibold text-sm text-primary">
                                            {app.serviceType}
                                            <span className="text-muted-foreground font-normal ml-2 text-xs">
                                              #{app.appointmentId}
                                            </span>
                                          </div>
                                          <div className="text-xs text-muted-foreground flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                              <Calendar className="h-3 w-3" />{" "}
                                              {app.appointmentDate}
                                            </span>
                                            <span className="flex items-center gap-1">
                                              <User className="h-3 w-3" />{" "}
                                              {app.staffId
                                                ? `Staff #${app.staffId}`
                                                : "Chưa gán"}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="mt-2 sm:mt-0">
                                          <Badge
                                            variant="outline"
                                            className={`${badgeClass} font-medium`}
                                          >
                                            {app.status}
                                          </Badge>
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="text-center text-sm text-muted-foreground py-4 border-2 border-dashed rounded-lg">
                                    Chưa có dữ liệu lịch sử.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
              <User className="h-12 w-12 mb-2 opacity-20" />
              <p>Chưa có khách hàng nào đặt lịch hẹn.</p>
            </div>
          )}
        </div>
              <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <div className="text-sm text-muted-foreground">
                      Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} trong số {totalItems} lịch hẹn
                  </div>

                  <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={goToPage}
                  />
              </div>
          </>
      )}
    </div>
  );
}
