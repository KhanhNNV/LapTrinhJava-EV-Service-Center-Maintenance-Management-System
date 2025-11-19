import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Car, Plus, Edit, Trash2, Bike, Loader2 } from "lucide-react";
import api from "@/services/api.ts";
import { toast } from "sonner";
import { CalendarCheck } from "lucide-react";
import {
  useCustomerVehicles,
  useAddVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
  VehicleDto,
} from "@/services/appointmentService.ts";

export default function Vehicles() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // State để xác định đang thêm mới hay sửa
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    model: "",
    brand: "",
    licensePlate: "",
    vehicleType: "ELECTRIC_CAR",
    // centerId: "1", // Default center
  });
  // YÊU CẦU: Sử dụng Service Hooks thay vì gọi api trực tiếp
  const { data: vehicles, isLoading } = useCustomerVehicles();
  const addVehicleMutation = useAddVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();

  // Xử lý mở form Edit
  const handleEditClick = (vehicle: VehicleDto) => {
    setEditingVehicleId(vehicle.vehicleId);
    setFormData({
      model: vehicle.model,
      brand: vehicle.brand,
      licensePlate: vehicle.licensePlate,
      vehicleType: vehicle.vehicleType,
      //   centerId: vehicle.centerId.toString(),
    });
    setIsDialogOpen(true);
  };

  // Xử lý đóng form và reset
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingVehicleId(null);
    setFormData({
      model: "",
      brand: "",
      licensePlate: "",
      vehicleType: "ELECTRIC_CAR",
      //   centerId: "1",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // YÊU CẦU: Gọi function từ Service
    if (editingVehicleId) {
      updateVehicleMutation.mutate(
        { id: editingVehicleId, data: formData },
        { onSuccess: handleCloseDialog }
      );
    } else {
      addVehicleMutation.mutate(formData, { onSuccess: handleCloseDialog });
    }
  };

  const isSubmitting =
    addVehicleMutation.isPending || updateVehicleMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Xe của tôi
          </h2>
          <p className="text-muted-foreground">
            Quản lý thông tin xe điện của bạn
          </p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) handleCloseDialog();
            else setIsDialogOpen(true);
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-[#007AFF] hover:bg-[#0066CC] shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4 mr-2" />
              Thêm xe mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingVehicleId ? "Cập nhật thông tin xe" : "Thêm xe mới"}
              </DialogTitle>
              <DialogDescription>
                {editingVehicleId
                  ? "Chỉnh sửa thông tin xe điện của bạn"
                  : "Nhập thông tin xe điện để quản lý bảo dưỡng"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                {/* Hãng xe & Model */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Hãng xe</Label>
                    <Input
                      id="brand"
                      placeholder="VD: VinFast"
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      placeholder="VD: VF e34"
                      value={formData.model}
                      onChange={(e) =>
                        setFormData({ ...formData, model: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Biển số */}
                <div className="space-y-2">
                  <Label htmlFor="licensePlate">Biển số xe</Label>
                  <Input
                    id="licensePlate"
                    placeholder="VD: 30A-12345"
                    value={formData.licensePlate}
                    onChange={(e) =>
                      setFormData({ ...formData, licensePlate: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Loại xe */}
                <div className="space-y-2">
                  <Label>Loại phương tiện</Label>
                  <Select
                    value={formData.vehicleType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, vehicleType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại xe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ELECTRIC_CAR">Ô tô điện</SelectItem>
                      <SelectItem value="ELECTRIC_MOTORBIKE">
                        Xe máy điện
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-[#007AFF] hover:bg-[#0066CC]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử
                      lý...
                    </>
                  ) : editingVehicleId ? (
                    "Cập nhật"
                  ) : (
                    "Thêm xe"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-sm border-gray-100">
              <CardContent className="pt-6">
                <div className="h-40 bg-gray-100 animate-pulse rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : vehicles && vehicles.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle: VehicleDto) => (
            <Card
              key={vehicle.vehicleId}
              className="shadow-sm border-gray-100 hover:shadow-md transition-all hover:-translate-y-1"
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        vehicle.vehicleType === "ELECTRIC_CAR"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {vehicle.vehicleType === "ELECTRIC_CAR" ? (
                        <Car className="w-5 h-5" />
                      ) : (
                        <Bike className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <span className="text-lg block">{vehicle.model}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {vehicle.brand}
                      </span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Biển số:</span>

                    <span className="font-semibold text-gray-900">
                      {vehicle.licensePlate}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Loại xe:</span>
                    <span className="font-medium">
                      {vehicle.vehicleType === "ELECTRIC_CAR"
                        ? "Ô tô điện"
                        : "Xe máy điện"}
                    </span>
                  </div>
                  {vehicle.recentMaintenanceDate ? (
                    <div className="text-sm flex items-center gap-2 text-orange-600">
                      <CalendarCheck className="w-4 h-4" />
                      Bảo dưỡng lần cuối:{" "}
                      {new Date(
                        vehicle.recentMaintenanceDate
                      ).toLocaleDateString("vi-VN")}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      Chưa có lịch sử bảo dưỡng
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-blue-50 hover:text-blue-600 border-blue-200"
                    onClick={() => handleEditClick(vehicle)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-red-50 hover:text-red-600 border-red-200"
                    onClick={() => {
                      if (
                        confirm(
                          `Bạn có chắc muốn xóa xe ${vehicle.model} (${vehicle.licensePlate})?`
                        )
                      ) {
                        deleteVehicleMutation.mutate(vehicle.vehicleId);
                      }
                    }}
                    disabled={deleteVehicleMutation.isPending}
                  >
                    {deleteVehicleMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-1" />
                        Xóa
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-sm border-dashed border-2 border-gray-200 bg-gray-50/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              Chưa có xe nào
            </h3>
            <p className="text-muted-foreground mb-4 text-center max-w-sm">
              Thêm phương tiện của bạn để dễ dàng đặt lịch bảo dưỡng và theo dõi
              lịch sử dịch vụ
            </p>
            <Button
              className="bg-[#007AFF] hover:bg-[#0066CC]"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm xe ngay
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
