// src/pages/admin/users/RoleBaseUserList.tsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { User, Role, userService } from "@/services/userService";
import { UserTable } from "@/components/admin/users/UserTable";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CreateUserDialog } from "@/components/admin/users/CreateUserDialog"; // Import component mới

export default function RoleBasedUserList() {
  // 1. Lấy role từ URL
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

  // 3. Hàm lấy tiêu đề trang
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
      const targetRole = role as Role;
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

  // 5. Effect trigger
  useEffect(() => {
    setCurrentPage(1);
  }, [role]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, currentPage, limit]);

  // 6. Xử lý hành động
  const handleEdit = (user: User) => {
    toast.info(`Chức năng sửa user ${user.username} đang phát triển`);
  };
  
  const handleDelete = async (user: User) => {
    if (confirm(`Bạn có chắc muốn xóa ${user.fullName}?`)) {
        try {
            // Giả định có hàm delete
            // await userService.deleteUser(user.userId); 
            toast.info(`Đã gửi yêu cầu xóa ${user.userId} (API delete chưa được nối trong demo này)`);
            fetchUsers();
        } catch (e) {
            toast.error("Xóa thất bại");
        }
    }
  };
  
  const handleView = (user: User) => {
    toast.info(`Xem chi tiết: ${user.fullName}`);
  };

  // Lọc local
  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.phoneNumber && u.phoneNumber.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Header: Tiêu đề & Nút Thêm (Thay bằng Component Dialog) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{getPageTitle(role)}</h1>
          <p className="text-muted-foreground">
            Danh sách {role?.toLowerCase()} trong hệ thống.
          </p>
        </div>
        
        {/* Nút Thêm Mới được nhúng ở đây, tự quản lý trạng thái mở Dialog */}
        <CreateUserDialog onSuccess={fetchUsers} /> 
      </div>

      {/* Toolbar: Tìm kiếm */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm theo Họ tên, Email, SĐT..."
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