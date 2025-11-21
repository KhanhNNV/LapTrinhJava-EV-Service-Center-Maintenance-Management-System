// src/components/admin/users/EditUserDialog.tsx

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Plus, Loader2, Calendar as CalendarIcon } from "lucide-react";

// Import services
import { userService, User } from "@/services/userService";
import { serviceCenterService, ServiceCenter } from "@/services/serviceCenterService"; // Nhớ import type
import { certificateService, Certificate, TechnicianCertificate } from "@/services/certificateService"; // Nhớ import type

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditUserDialog({ user, open, onOpenChange, onSuccess }: EditUserDialogProps) {
  // Form hook
  const { register, handleSubmit, setValue, reset, watch } = useForm();
  
  // Local State
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [allCertificates, setAllCertificates] = useState<Certificate[]>([]);
  const [userCertificates, setUserCertificates] = useState<any[]>([]); // Dùng any hoặc type DTO trả về
  const [loading, setLoading] = useState(false);

  // State cho form thêm chứng chỉ (Tech only)
  const [newCertId, setNewCertId] = useState<string>("");
  const [newCertDate, setNewCertDate] = useState<string>("");
  const [newCertCode, setNewCertCode] = useState<string>("");

  // --- 1. LOAD DỮ LIỆU KHI MỞ DIALOG ---
  useEffect(() => {
    if (open && user) {
      // Reset form với dữ liệu user hiện tại
      reset({
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        address: user.address || "",
        role: user.role,
        email: user.email,
        username: user.username,
        // serviceCenterId sẽ được set trong loadReferenceData sau khi có list
      });

      loadReferenceData();
    }
  }, [open, user, reset]);

  // --- 2. HÀM TẢI DỮ LIỆU THAM CHIẾU ---
  const loadReferenceData = async () => {
    try {
      // 2.1 Load Service Centers (Nếu là Staff/Tech)
      if (user?.role === "STAFF" || user?.role === "TECHNICIAN") {
        const centers = await serviceCenterService.getAllServiceCenters();
        setServiceCenters(centers);

        // Logic mapping Center Name -> Center ID để hiển thị mặc định
        if (user.centerName) {
            const currentCenter = centers.find((c) => c.centerName === user.centerName);
            if (currentCenter) {
                setValue("serviceCenterId", currentCenter.centerId.toString());
            }
        }
      }

      // 2.2 Load Certificates (Nếu là Tech)
      if (user?.role === "TECHNICIAN") {
        // Lấy danh sách định nghĩa chứng chỉ (để dropdown)
        // const certs = await certificateService.getAllCertificates(); // Dùng API
        
        // HOẶC FIX CỨNG (nếu API get all certs đang lỗi như bạn gặp trước đó)
        const certs = [
             { certificateId: 1, certificateName: "Chứng chỉ sửa chữa Ô tô điện" },
             { certificateId: 2, certificateName: "Chứng chỉ sửa chữa Xe máy điện" }
        ] as Certificate[];
        
        setAllCertificates(certs);

        // Lấy danh sách chứng chỉ CỦA USER này
        await loadUserCertificates(user.userId);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      // toast.error("Không tải được dữ liệu tham chiếu"); // Có thể ẩn để đỡ phiền
    }
  };

  const loadUserCertificates = async (userId: number) => {
    try {
      const data = await userService.getCertificatesByUserId(userId);
      setUserCertificates(data);
    } catch (e) {
      console.log("User này chưa có chứng chỉ hoặc lỗi API:", e);
      setUserCertificates([]); 
    }
  };

  // --- 3. XỬ LÝ SUBMIT CẬP NHẬT USER ---
  const onSubmit = async (data: any) => {
    if (!user) return;
    try {
      setLoading(true);

      // Chuẩn bị payload
      const updatePayload = {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        address: data.address,
        // Chỉ gửi serviceCenterId nếu là Staff/Tech
        centerId: (user.role === "STAFF" || user.role === "TECHNICIAN") 
            ? Number(data.serviceCenterId) : null
      };

      await userService.updateUser(user.userId, updatePayload);
      
      toast.success(`Đã cập nhật thông tin cho ${user.username}`);
      onSuccess(); 
      onOpenChange(false);
    } catch (error) {
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // --- 4. CÁC HÀM XỬ LÝ CHỨNG CHỈ (TECH ONLY) ---
  const handleAddCert = async () => {
    if (!user || !newCertId || !newCertDate || !newCertCode) {
        toast.warning("Vui lòng nhập đầy đủ thông tin chứng chỉ");
        return;
    }
    try {
        await userService.addCertificateToTech(user.userId, {
            certificateId: Number(newCertId),
            issueDate: newCertDate,
            credentialId: newCertCode,
            notes: "Added by Admin via Edit Form"
        });
        toast.success("Đã thêm chứng chỉ thành công");
        
        await loadUserCertificates(user.userId);
        // Reset form nhỏ
        setNewCertId(""); 
        setNewCertDate(""); 
        setNewCertCode("");
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Lỗi thêm chứng chỉ (Có thể mã số đã tồn tại)");
    }
  };

  const handleRemoveCert = async (certId: number) => {
     if (!user) return;
     if (!confirm("Bạn chắc chắn muốn xóa chứng chỉ này?")) return;

     try {
       // Lưu ý: certId ở đây là certificateId (loại chứng chỉ)
       // API removeCer trong endpoints đang dùng path: /api/users/{userId}/certificates/{certId}
       await userService.removeCertificateFromTech(user.userId, certId);
       toast.success("Đã xóa chứng chỉ");
       await loadUserCertificates(user.userId);
     } catch (error) {
       toast.error("Lỗi xóa chứng chỉ");
     }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* --- KHỐI READ-ONLY --- */}
          <div className="grid grid-cols-3 gap-4 bg-muted/50 p-4 rounded-lg border">
            <div>
              <Label className="text-xs text-muted-foreground">Username</Label>
              <div className="font-medium text-sm">{user.username}</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <div className="font-medium text-sm">{user.email}</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Role</Label>
              <div className="font-bold text-sm text-primary">{user.role}</div>
            </div>
          </div>

          {/* --- KHỐI EDIT --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Họ và tên</Label>
              <Input {...register("fullName")} placeholder="Nhập họ tên..." />
            </div>

            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input {...register("phoneNumber")} placeholder="09xxx..." />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Địa chỉ</Label>
              <Input {...register("address")} placeholder="Địa chỉ liên hệ..." />
            </div>

            {/* Dropdown Service Center */}
            {(user.role === "STAFF" || user.role === "TECHNICIAN") && (
              <div className="col-span-2 space-y-2 p-3 bg-blue-50 rounded border border-blue-100">
                <Label className="text-blue-700 font-semibold">Trạm dịch vụ trực thuộc</Label>
                <Select 
                  onValueChange={(val) => setValue("serviceCenterId", val)}
                  defaultValue={watch("serviceCenterId")} 
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="-- Chọn trạm dịch vụ --" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCenters.map((center) => (
                      <SelectItem key={center.centerId} value={center.centerId.toString()}>
                        {center.centerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* --- KHỐI CHỨNG CHỈ (TECHNICIAN) --- */}
          {user.role === "TECHNICIAN" && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  📜 Hồ sơ chứng chỉ 
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full font-normal">
                      {userCertificates.length}
                  </span>
              </h3>
              
              {/* List */}
              <div className="space-y-2 mb-4 max-h-[150px] overflow-y-auto pr-1">
                {userCertificates.length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-2 border border-dashed rounded">Chưa có chứng chỉ.</p>
                )}
                {userCertificates.map((cert) => (
                  <div key={cert.certificateId} className="flex justify-between items-center bg-white p-2 rounded border text-sm">
                    <div>
                        <div className="font-medium text-blue-900">{cert.certificateName}</div>
                        <div className="text-xs text-gray-500">
                            Ngày cấp: {cert.issueDate} | Mã: {cert.credentialId}
                        </div>
                    </div>
                    <Button 
                        type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500"
                        onClick={() => handleRemoveCert(cert.certificateId)}
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Form Thêm */}
              <div className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-2 rounded border">
                  <div className="col-span-5">
                     <Select onValueChange={setNewCertId} value={newCertId}>
                        <SelectTrigger className="h-8 text-xs bg-white"><SelectValue placeholder="Loại chứng chỉ..." /></SelectTrigger>
                        <SelectContent>
                             {allCertificates.map(c => (
                                 <SelectItem key={c.certificateId} value={c.certificateId.toString()}>
                                     {c.certificateName}
                                 </SelectItem>
                             ))}
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="col-span-3">
                     <Input 
                        className="h-8 text-xs bg-white" 
                        placeholder="Mã số..." 
                        value={newCertCode} 
                        onChange={e => setNewCertCode(e.target.value)}
                     />
                  </div>
                  <div className="col-span-3">
                     <Input 
                        type="date" className="h-8 text-xs bg-white" 
                        value={newCertDate} 
                        onChange={e => setNewCertDate(e.target.value)}
                     />
                  </div>
                  <div className="col-span-1">
                      <Button type="button" size="icon" className="h-8 w-8" onClick={handleAddCert}>
                         <Plus className="h-4 w-4"/>
                      </Button>
                  </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}