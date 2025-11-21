import React from "react";
import { User, Role } from "@/services/userService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns"

interface UserTableProps {
  data: User[];
  currentPage: number;
  totalPages: number;
  limit: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onView: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  data,
  currentPage,
  totalPages,
  limit,
  totalElements,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
  onView,
}) => {
  
  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case "ADMIN": return "destructive";
      case "STAFF": return "default";
      case "TECHNICIAN": return "secondary";
      default: return "outline";
    }
  };

  // Format ngày giờ chi tiết
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>

              <TableHead className="w-[50px]">ID</TableHead>
              

              <TableHead className="text-left">Tài khoản</TableHead>
              
              <TableHead className="text-left">Họ và Tên</TableHead>
              <TableHead className="text-left">Email</TableHead>
              <TableHead className="text-left">SĐT</TableHead>
              
              <TableHead className="text-center">Cơ sở</TableHead>
              
              <TableHead className="text-center">Vai trò</TableHead>
              
              <TableHead className="text-left">Ngày tham gia</TableHead>
              
              <TableHead className="text-center">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                  Không có dữ liệu.
                </TableCell>
              </TableRow>
            ) : (
              data.map((user) => (

                <TableRow key={user.userId}>
                  <TableCell className="font-medium">{user.userId}</TableCell>

                  <TableCell className="font-medium text-blue-600">
                    {user.username}
                  </TableCell>
                  
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phoneNumber || "---"}</TableCell>
                  
                
                  <TableCell className="text-center">
                    {user.centerName ? (
                       <span className="font-medium text-gray-700">{user.centerName}</span>
                    ) : (
                       <span className="text-muted-foreground text-xs">---</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge variant={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  
                  {/* Hiển thị ngày giờ */}
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(user.createdAt)}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
                        <Edit className="h-4 w-4 text-slate-800" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onView(user)}>
                        <Eye className="h-4 w-4 text-orange-400" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(user)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Phần phân trang giữ nguyên */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Hiển thị</span>
          <Select value={String(limit)} onValueChange={(val) => onLimitChange(Number(val))}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={limit} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span>/ {totalElements} kết quả</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">Trang {currentPage} / {totalPages || 1}</div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};