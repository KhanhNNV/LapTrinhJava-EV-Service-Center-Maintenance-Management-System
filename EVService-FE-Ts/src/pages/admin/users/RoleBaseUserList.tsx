import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { User, Role, userService } from "@/services/userService";
import { UserTable } from "@/components/admin/users/UserTable";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CreateUserDialog } from "@/components/admin/users/CreateUserDialog";
import { EditUserDialog } from "@/components/admin/users/EditUserDialog";

export default function RoleBasedUserList() {
  // ... (Các phần code state và fetchUsers giữ nguyên) ...
  const { role } = useParams<{ role: string }>();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);


  const getPageTitle = (r?: string) => {
    switch (r) {
      case "CUSTOMER": return "Quản lý Khách hàng";
      case "STAFF": return "Quản lý Nhân viên";
      case "TECHNICIAN": return "Quản lý Kỹ thuật viên";
      case "ADMIN": return "Quản lý Quản trị viên";
      default: return "Danh sách người dùng";
    }
  };

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

  useEffect(() => {
    setCurrentPage(1);
  }, [role]);

  useEffect(() => {
    fetchUsers();
  }, [role, currentPage, limit]);


  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditOpen(true);
  };

  // --- [CẬP NHẬT QUAN TRỌNG] HÀM XÓA MỚI ---
  const handleDelete = async (user: User) => {

    try {
      // Gọi API xóa thật sự
      await userService.deleteUser(user.userId);
      
      toast.success(`Đã xóa người dùng ${user.username} thành công`);
      
      // Tải lại danh sách để cập nhật giao diện
      fetchUsers();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Xóa thất bại. Có thể người dùng đang có dữ liệu liên quan.");
    }
  };

  const handleView = (user: User) => {
    console.log("View detail requested for:", user.fullName);
  };

  // ... (Phần filter và render giữ nguyên) ...
  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.phoneNumber && u.phoneNumber.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{getPageTitle(role)}</h1>
          <p className="text-muted-foreground">
            Danh sách {role?.toLowerCase()} trong hệ thống.
          </p>
        </div>
        <CreateUserDialog onSuccess={fetchUsers} />
      </div>

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

        />
      )}

      <EditUserDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        user={editingUser}
        onSuccess={fetchUsers}
      />
    </div>
  );
}