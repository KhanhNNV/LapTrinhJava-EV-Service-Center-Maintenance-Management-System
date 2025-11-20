import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { User, Role, userService } from "@/services/userService";
import { UserTable } from "@/components/admin/users/UserTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RoleBasedUserList() {
  // 1. Lấy role từ URL (ví dụ: /users/CUSTOMER -> role = "CUSTOMER")
  const { role } = useParams<{ role: string }>();

  // 2. State quản lý dữ liệu
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 3. Hàm lấy tiêu đề trang dựa trên role
  const getPageTitle = (r?: string) => {
    switch (r) {
      case "CUSTOMER": return "Quản lý Khách hàng";
      case "STAFF": return "Quản lý Nhân viên";
      case "TECHNICIAN": return "Quản lý Kỹ thuật viên";
      case "ADMIN": return "Quản lý Quản trị viên";
      default: return "Danh sách người dùng";
    }
  };

  // 4. Hàm gọi API lấy danh sách
  const fetchUsers = async () => {
    if (!role) return;
    
    setLoading(true);
    try {
      // Ép kiểu role từ string sang Enum Role
      const targetRole = role as Role;
      
      // Gọi API
      const response = await userService.getListUserByRole(targetRole, currentPage, limit);
      
      setUsers(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  // 5. Gọi API khi URL(role), trang(currentPage) hoặc limit thay đổi
  useEffect(() => {
    // Reset về trang 1 khi đổi role
    setCurrentPage(1);
  }, [role]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, currentPage, limit]);

  // 6. Xử lý các hành động (tạm thời log ra console)
  const handleEdit = (user: User) => {
    toast.info(`Chức năng sửa user ${user.username} đang phát triển`);
  };
  
  const handleDelete = (user: User) => {
    if (confirm(`Bạn có chắc muốn xóa ${user.fullName}?`)) {
        toast.info(`Đã gửi yêu cầu xóa ${user.userId}`);
    }
  };
  
  const handleView = (user: User) => {
    toast.info(`Xem chi tiết: ${user.fullName}`);
  };

  const handleCreate = () => {
     toast.info(`Mở form tạo mới cho role: ${role}`);
  };

  // 7. Lọc local (nếu muốn tìm kiếm nhanh trong trang hiện tại)
  // Hoặc bạn có thể gọi API search nếu backend hỗ trợ
  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.phoneNumber && u.phoneNumber.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Header: Tiêu đề & Nút Thêm */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{getPageTitle(role)}</h1>
          <p className="text-muted-foreground">
            Danh sách {role?.toLowerCase()} trong hệ thống.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Thêm mới
        </Button>
      </div>

      {/* Toolbar: Tìm kiếm */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm theo Họ và tên || Email || SĐT "
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Data */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <UserTable
          data={filteredUsers}
          currentPage={currentPage}
          totalPages={totalPages}
          limit={limit}
          totalElements={totalElements}
          onPageChange={setCurrentPage}
          onLimitChange={setLimit}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}
    </div>
  );
}