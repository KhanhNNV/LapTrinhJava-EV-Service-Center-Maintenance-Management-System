import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import api from "@/services/api.ts";
import { useToast } from "@/hooks/use-toast";
import { Building2, MapPin, Phone, Mail, Edit, Trash2, Search, Filter } from "lucide-react";

interface ServiceCenter {
  centerId: number;
  centerName: string;
  address: string;
  phoneNumber: string;
  email: string;
}

interface ServiceCenterRequest {
  centerName: string;
  address: string;
  phoneNumber: string;
  email: string;
}

export default function AdminServiceCenters() {
  const { toast } = useToast();
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<ServiceCenter[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<ServiceCenter | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; //Số trung tâm trên 1 trang

  const [newCenter, setNewCenter] = useState<ServiceCenterRequest>({
    centerName: "",
    address: "",
    phoneNumber: "",
    email: "",
  });

  useEffect(() => {
    fetchCenters();
  }, []);



  const fetchCenters = async () => {
    try {
      const response = await api.get("/api/service-centers");
      setCenters(response.data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách trung tâm dịch vụ",
        variant: "destructive",
      });
    }
  };

  // Hàm kiểm tra trùng lặp
  const checkDuplicateCenter = (center: ServiceCenterRequest, excludeId?: number): boolean => {
    return centers.some(existingCenter => {
      if (excludeId && existingCenter.centerId === excludeId) return false;
      
      return (
        existingCenter.centerName.toLowerCase() === center.centerName.toLowerCase() ||
        existingCenter.address.toLowerCase() === center.address.toLowerCase() ||
        existingCenter.phoneNumber === center.phoneNumber ||
        existingCenter.email.toLowerCase() === center.email.toLowerCase()
      );
    });
  };





  // Phân trang
  const totalPages = Math.ceil(filteredCenters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCenters = filteredCenters.slice(startIndex, startIndex + itemsPerPage);

  const createCenter = async () => {
    // Kiểm tra trùng lặp
    if (checkDuplicateCenter(newCenter)) {
      toast({
        title: "Lỗi",
        description: "Tên trung tâm, địa chỉ, số điện thoại hoặc email đã tồn tại",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.post("/api/service-centers", newCenter);
      toast({
        title: "Thành công",
        description: "Đã tạo trung tâm dịch vụ thành công",
      });
      setIsCreateOpen(false);
      setNewCenter({ centerName: "", address: "", phoneNumber: "", email: "" });
      fetchCenters();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo trung tâm dịch vụ",
        variant: "destructive",
      });
    }
  };

  const updateCenter = async () => {
    if (!editingCenter) return;

    // Kiểm tra trùng lặp (loại trừ chính bản ghi đang chỉnh sửa)
    if (checkDuplicateCenter(newCenter, editingCenter.centerId)) {
      toast({
        title: "Lỗi",
        description: "Tên trung tâm, địa chỉ, số điện thoại hoặc email đã tồn tại",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.put(`/api/service-centers/${editingCenter.centerId}`, newCenter);
      toast({
        title: "Thành công",
        description: "Đã cập nhật trung tâm dịch vụ thành công",
      });
      setIsEditOpen(false);
      setEditingCenter(null);
      setNewCenter({ centerName: "", address: "", phoneNumber: "", email: "" });
      fetchCenters();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trung tâm dịch vụ",
        variant: "destructive",
      });
    }
  };

  const deleteCenter = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa trung tâm "${name}"?`)) return;
    
    try {
      await api.delete(`/api/service-centers/${id}`);
      toast({
        title: "Thành công",
        description: "Đã xóa trung tâm dịch vụ thành công",
      });
      fetchCenters();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa trung tâm dịch vụ",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (center: ServiceCenter) => {
    setEditingCenter(center);
    setNewCenter({
      centerName: center.centerName,
      address: center.address,
      phoneNumber: center.phoneNumber,
      email: center.email,
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setNewCenter({ centerName: "", address: "", phoneNumber: "", email: "" });
    setEditingCenter(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý Trung tâm Dịch vụ</h2>
          <p className="text-muted-foreground">
            Quản lý tất cả các trung tâm dịch vụ
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Building2 className="h-4 w-4 mr-2" />
              Thêm Trung tâm
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tạo Trung tâm Dịch vụ Mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tên trung tâm *</Label>
                <Input
                  value={newCenter.centerName}
                  onChange={(e) => setNewCenter({ ...newCenter, centerName: e.target.value })}
                  placeholder="Nhập tên trung tâm"
                />
              </div>
              <div>
                <Label>Địa chỉ *</Label>
                <Input
                  value={newCenter.address}
                  onChange={(e) => setNewCenter({ ...newCenter, address: e.target.value })}
                  placeholder="Nhập địa chỉ đầy đủ"
                />
              </div>
              <div>
                <Label>Số điện thoại *</Label>
                <Input
                  value={newCenter.phoneNumber}
                  onChange={(e) => setNewCenter({ ...newCenter, phoneNumber: e.target.value })}
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newCenter.email}
                  onChange={(e) => setNewCenter({ ...newCenter, email: e.target.value })}
                  placeholder="Nhập địa chỉ email"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createCenter}>Tạo Trung tâm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Lọc theo thành phố" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thành phố</SelectItem>
              <SelectItem value="hồ chí minh">Hồ Chí Minh</SelectItem>
              <SelectItem value="hà nội">Hà Nội</SelectItem>
              <SelectItem value="khác">Thành phố khác</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Thống kê */}
      <div className="text-sm text-muted-foreground">
        Hiển thị {paginatedCenters.length} trong tổng số {filteredCenters.length} trung tâm
        {cityFilter !== "all" && ` (đã lọc theo ${cityFilter === "hồ chí minh" ? "Hồ Chí Minh" : cityFilter === "hà nội" ? "Hà Nội" : "thành phố khác"})`}
      </div>

      {/* Danh sách trung tâm */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paginatedCenters.map((center) => (
          <Card key={center.centerId} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="truncate">{center.centerName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="break-words">{center.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{center.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{center.email}</span>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openEditDialog(center)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Sửa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteCenter(center.centerId, center.centerName)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Dialog chỉnh sửa */}
      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Trung tâm Dịch vụ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên trung tâm *</Label>
              <Input
                value={newCenter.centerName}
                onChange={(e) => setNewCenter({ ...newCenter, centerName: e.target.value })}
                placeholder="Nhập tên trung tâm"
              />
            </div>
            <div>
              <Label>Địa chỉ *</Label>
              <Input
                value={newCenter.address}
                onChange={(e) => setNewCenter({ ...newCenter, address: e.target.value })}
                placeholder="Nhập địa chỉ đầy đủ"
              />
            </div>
            <div>
              <Label>Số điện thoại *</Label>
              <Input
                value={newCenter.phoneNumber}
                onChange={(e) => setNewCenter({ ...newCenter, phoneNumber: e.target.value })}
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={newCenter.email}
                onChange={(e) => setNewCenter({ ...newCenter, email: e.target.value })}
                placeholder="Nhập địa chỉ email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={updateCenter}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hiển thị khi không có kết quả */}
      {paginatedCenters.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy trung tâm nào</h3>
            <p className="text-muted-foreground">
              {searchTerm || cityFilter !== "all" 
                ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc" 
                : "Chưa có trung tâm dịch vụ nào được tạo"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}