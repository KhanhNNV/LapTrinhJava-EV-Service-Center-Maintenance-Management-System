import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/services/api.ts";
import { useToast } from "@/hooks/use-toast";
import {
  Wrench,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Clock3,
  Layers3,
  Search,
  PackageOpen,
} from "lucide-react";

// ---- Types khớp với BE ----
interface ServiceItem {
  id: number;
  itemName: string;
  description?: string;
  price: number;
}

interface ServicePackage {
  packageId: number;
  packageName: string;
  description: string;
  price: number;
  duration: number;
  serviceItems: ServiceItem[];
}

// Form state dùng chung cho Create & Edit
interface PackageFormState {
  packageName: string;
  description: string;
  price: number | "";
  duration: number | "";
  serviceItemIds: number[];
}

export default function AdminServicePackages() {
  const { toast } = useToast();

  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(
    null
  );

  const [form, setForm] = useState<PackageFormState>({
    packageName: "",
    description: "",
    price: "",
    duration: "",
    serviceItemIds: [],
  });

  const [search, setSearch] = useState("");

  // -------- Fetch data ----------
  useEffect(() => {
    fetchPackages();
    fetchServiceItems();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await api.get<ServicePackage[]>("/api/service-packages");
      setPackages(res.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch service packages",
        variant: "destructive",
      });
    }
  };

  const fetchServiceItems = async () => {
    try {
      const res = await api.get<ServiceItem[]>("/api/service-items");
      setServiceItems(res.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Không thể lấy các mục dịch vụ",
        variant: "destructive",
      });
    }
  };

  // --------- Helpers UI ----------
  const resetForm = () =>
    setForm({
      packageName: "",
      description: "",
      price: "",
      duration: "",
      serviceItemIds: [],
    });

  const openCreateDialog = () => {
    setEditingPackage(null);
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditDialog = (pkg: ServicePackage) => {
    setEditingPackage(pkg);
    setForm({
      packageName: pkg.packageName,
      description: pkg.description,
      price: pkg.serviceItems.reduce((s, i) => s + i.price, 0),
      duration: pkg.duration,
      serviceItemIds: pkg.serviceItems?.map((i) => i.id) ?? [],
    });
    setIsEditOpen(true);
  };

  const handleFormChange = (
    field: keyof PackageFormState,
    value: string | number | number[]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleServiceItem = (id: number) => {
    setForm((prev) => {
      let newIds: number[];

      if (prev.serviceItemIds.includes(id)) {
        newIds = prev.serviceItemIds.filter((i) => i !== id);
      } else {
        newIds = [...prev.serviceItemIds, id];
      }

      // Tính tổng giá mới dựa trên danh sách items đã chọn
      const newPrice = newIds.reduce((sum, itemId) => {
        const item = serviceItems.find((i) => i.id === itemId);
        return item ? sum + item.price : sum;
      }, 0);

      return {
        ...prev,
        serviceItemIds: newIds,
        price: newPrice, // Cập nhật giá package tự động
      };
    });
  };

  // ------- Submit Create / Update -------
  const submitCreate = async () => {
    if (!form.packageName || !form.price || !form.duration) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tên, giá và thời hạn gói.",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.post("/api/service-packages", {
        packageName: form.packageName,
        description: form.description,
        price: Number(form.price),
        duration: Number(form.duration),
        serviceItemIds: form.serviceItemIds,
      });

      toast({
        title: "Success",
        description: "Gói dịch vụ được tạo thành công!",
      });

      setIsCreateOpen(false);
      resetForm();
      fetchPackages();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Không tạo được gói dịch vụ.",
        variant: "destructive",
      });
    }
  };

  const submitUpdate = async () => {
    if (!editingPackage) return;

    if (!form.packageName || !form.price || !form.duration) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tên và thời hạn gói.",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.put(`/api/service-packages/${editingPackage.packageId}`, {
        packageName: form.packageName,
        description: form.description,
        price: Number(form.price),
        duration: Number(form.duration),
        serviceItemIds: form.serviceItemIds,
      });

      toast({
        title: "Success",
        description: "Gói dịch vụ được cập nhật thành công",
      });

      setIsEditOpen(false);
      setEditingPackage(null);
      resetForm();
      fetchPackages();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Không cập nhật được gói dịch vụ",
        variant: "destructive",
      });
    }
  };

  const deletePackage = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa gói dịch vụ này không?")) return;

    try {
      await api.delete(`/api/service-packages/${id}`);
      toast({
        title: "Deleted",
        description: "Gói dịch vụ đã được xóa thành công",
      });
      fetchPackages();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Không xóa được gói dịch vụ",
        variant: "destructive",
      });
    }
  };

  // --------- Dashboard metrics ----------
  const filteredPackages = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return packages;
    return packages.filter(
      (p) =>
        p.packageName.toLowerCase().includes(keyword) ||
        p.description?.toLowerCase().includes(keyword)
    );
  }, [packages, search]);

  const stats = useMemo(() => {
    if (packages.length === 0) {
      return {
        total: 0,
        avgPrice: 0,
        avgDuration: 0,
        totalItems: 0,
      };
    }

    const total = packages.length;
    const totalPrice = packages.reduce((sum, p) => sum + (p.price || 0), 0);
    const totalDuration = packages.reduce(
      (sum, p) => sum + (p.duration || 0),
      0
    );
    const totalItems = packages.reduce(
      (sum, p) => sum + (p.serviceItems?.length || 0),
      0
    );

    return {
      total,
      avgPrice: totalPrice / total,
      avgDuration: totalDuration / total,
      totalItems,
    };
  }, [packages]);

  // ------------- Component -------------
  const renderPackageForm = (mode: "create" | "edit") => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Tên gói</Label>
          <Input
            value={form.packageName}
            onChange={(e) => handleFormChange("packageName", e.target.value)}
            placeholder="Ví dụ: Gói bảo dưỡng toàn diện"
          />
        </div>
          <div>
              <Label>Giá (VNĐ)</Label>
              <Input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                      handleFormChange(
                          "price",
                          e.target.value ? Number(e.target.value) : ""
                      )
                  }
                  min={0}
              />
          </div>
        <div>
          <Label>Thời hạn (tháng)</Label>
          <Input
            type="number"
            value={form.duration}
            onChange={(e) =>
              handleFormChange(
                "duration",
                e.target.value ? Number(e.target.value) : ""
              )
            }
            min={1}
          />
        </div>
      </div>

      <div>
        <Label>Mô tả</Label>
        <Textarea
          value={form.description}
          onChange={(e) => handleFormChange("description", e.target.value)}
          placeholder="Mô tả ngắn về gói dịch vụ..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Danh sách hạng mục dịch vụ trong gói</Label>
        <div className="max-h-60 border rounded-md p-2 overflow-y-auto bg-muted/40">
          {serviceItems.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              Chưa có hạng mục dịch vụ nào.
            </p>
          ) : (
            serviceItems.map((item) => {
              const checked = form.serviceItemIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleServiceItem(item.id)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 text-left text-sm rounded-md mb-1 hover:bg-accent transition ${
                    checked ? "bg-accent border border-primary/40" : ""
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{item.itemName}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {item.description}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground">
                      {item.price.toLocaleString()} đ
                    </span>
                    {checked && (
                      <Badge variant="outline" className="text-[10px]">
                        Đã chọn
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Đã chọn:{" "}
          <span className="font-semibold">{form.serviceItemIds.length}</span>{" "}
          hạng mục.
        </p>
      </div>

      <DialogFooter>
        <Button
          onClick={mode === "create" ? submitCreate : submitUpdate}
          className="w-full md:w-auto"
        >
          {mode === "create" ? "Tạo gói dịch vụ" : "Cập nhật gói dịch vụ"}
        </Button>
      </DialogFooter>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header + Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <PackageOpen className="w-7 h-7 text-primary" />
            Quản lý Gói dịch vụ
          </h2>
          <p className="text-muted-foreground">
            Cấu hình các gói dịch vụ, giá và danh sách hạng mục đi kèm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-2.5 text-muted-foreground" />
            <Input
              className="pl-8 w-[220px]"
              placeholder="Tìm theo tên / mô tả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo gói mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tạo gói dịch vụ mới</DialogTitle>
              </DialogHeader>
              {renderPackageForm("create")}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Tổng số gói
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">{stats.total}</span>
            <Layers3 className="w-5 h-5 text-primary" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Giá trung bình
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {stats.avgPrice.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}{" "}
              đ
            </span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Thời hạn trung bình
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {stats.avgDuration.toFixed(1)}
            </span>
            <Clock3 className="w-5 h-5 text-blue-500" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Tổng hạng mục / tất cả gói
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">{stats.totalItems}</span>
            <Wrench className="w-5 h-5 text-orange-500" />
          </CardContent>
        </Card>
      </div>

      {/* Packages Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPackages.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-10 text-muted-foreground border rounded-lg border-dashed">
            <PackageOpen className="w-10 h-10 mb-2" />
            <p className="font-medium">Chưa có gói dịch vụ nào.</p>
            <p className="text-sm">
              Hãy tạo gói đầu tiên để bắt đầu cấu hình hệ thống.
            </p>
          </div>
        ) : (
          filteredPackages.map((pkg) => (
            <Card
              key={pkg.packageId}
              className="hover:shadow-md transition-shadow flex flex-col"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Wrench className="h-5 w-5 text-primary" />
                    <span className="line-clamp-1">{pkg.packageName}</span>
                  </CardTitle>
                  <Badge variant="outline" className="text-[11px]">
                    {pkg.duration} tháng
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {pkg.description || "Không có mô tả"}
                </p>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Giá gói:</span>
                    <span className="font-semibold text-lg">
                      {pkg.price.toLocaleString()} đ
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Số hạng mục dịch vụ:
                    </span>
                    <Badge variant="secondary">
                      {editingPackage &&
                      editingPackage.packageId === pkg.packageId
                        ? form.serviceItemIds.length // 🔥 cập nhật theo lựa chọn mới
                        : pkg.serviceItems?.length || 0}{" "}
                      items
                    </Badge>
                  </div>

                  {pkg.serviceItems && pkg.serviceItems.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Một số hạng mục:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {pkg.serviceItems.slice(0, 4).map((item) => (
                          <Badge
                            key={item.id}
                            variant="outline"
                            className="text-[10px]"
                          >
                            {item.itemName}
                          </Badge>
                        ))}
                        {pkg.serviceItems.length > 4 && (
                          <span className="text-[11px] text-muted-foreground">
                            +{pkg.serviceItems.length - 4} nữa...
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-3">
                  <Dialog
                    open={
                      isEditOpen && editingPackage?.packageId === pkg.packageId
                    }
                    onOpenChange={(open) => {
                      if (!open) {
                        setIsEditOpen(false);
                        setEditingPackage(null);
                        resetForm();
                      } else {
                        openEditDialog(pkg);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Sửa
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Cập nhật gói dịch vụ</DialogTitle>
                      </DialogHeader>
                      {renderPackageForm("edit")}
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deletePackage(pkg.packageId)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
