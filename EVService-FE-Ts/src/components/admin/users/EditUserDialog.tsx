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
import { Trash2, Plus, Loader2, Edit, Save, X } from "lucide-react";

// Import services
import { userService, User } from "@/services/userService";
import { serviceCenterService, ServiceCenter } from "@/services/serviceCenterService";
import { certificateService, Certificate } from "@/services/certificateService";

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditUserDialog({ user, open, onOpenChange, onSuccess }: EditUserDialogProps) {
  // Form hook cho User Info
  const { register, handleSubmit, setValue, reset, watch } = useForm();

  // Local State
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [allCertificates, setAllCertificates] = useState<Certificate[]>([]); // Danh sách loại chứng chỉ để chọn
  const [userCertificates, setUserCertificates] = useState<any[]>([]); // Danh sách chứng chỉ CỦA User
  const [loading, setLoading] = useState(false);

  // State cho form chứng chỉ
  const [certForm, setCertForm] = useState({
    certificateId: "",
    credentialId: "",
    issueDate: "",
    notes: ""
  });
  const [editingCertId, setEditingCertId] = useState<number | null>(null); // ID của loại chứng chỉ đang sửa (nếu có)

  // --- 1. LOAD DỮ LIỆU KHI MỞ DIALOG ---
  useEffect(() => {
    if (open && user) {
      // Reset form User Info
      reset({
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        address: user.address || "",
        role: user.role,
        email: user.email,
        username: user.username,
      });

      loadReferenceData();
    }
  }, [open, user, reset]);

  // --- 2. HÀM TẢI DỮ LIỆU THAM CHIẾU ---
  const loadReferenceData = async () => {
    if (!user) return;
    try {
      // 2.1 Load Service Centers (Nếu là Staff/Tech)
      if (user.role === "STAFF" || user.role === "TECHNICIAN") {
        const centers = await serviceCenterService.getAllServiceCenters();
        setServiceCenters(centers);

        // Map Center Name -> ID
        if (user.centerName) {
          const currentCenter = centers.find((c) => c.centerName === user.centerName);
          if (currentCenter) {
            setValue("serviceCenterId", currentCenter.centerId.toString());
          }
        }
      }

      // 2.2 Load Certificates (Nếu là Tech)
      if (user.role === "TECHNICIAN") {
        // Lấy danh sách tất cả loại chứng chỉ hệ thống
        const allCerts = await certificateService.getAllCertificates();
        setAllCertificates(allCerts);

        // Lấy danh sách chứng chỉ CỦA USER này
        await loadUserCertificates(user.userId);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu tham chiếu:", error);
      toast.error("Không thể tải dữ liệu danh mục.");
    }
  };

  const loadUserCertificates = async (userId: number) => {
    try {
      const data = await userService.getCertificatesByUserId(userId);
      setUserCertificates(data);
    } catch (e) {
      console.log("Lỗi lấy chứng chỉ user:", e);
      setUserCertificates([]);
    }
  };

  // --- 3. XỬ LÝ SUBMIT CẬP NHẬT USER ---
  const onSubmitUser = async (data: any) => {
    if (!user) return;
    try {
      setLoading(true);
      const updatePayload = {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        address: data.address,
        centerId: (user.role === "STAFF" || user.role === "TECHNICIAN")
          ? Number(data.serviceCenterId) : null
      };

      await userService.updateUser(user.userId, updatePayload);

      toast.success(`Đã cập nhật thông tin cho ${user.username}`);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại.");
    } finally {
      setLoading(false);
    }
  };

  // --- 4. CÁC HÀM XỬ LÝ CHỨNG CHỈ ---

  // Chọn chứng chỉ để sửa
  const handleEditCertClick = (cert: any) => {
    setEditingCertId(cert.certificateId); // Lưu lại ID loại chứng chỉ đang sửa
    setCertForm({
      certificateId: cert.certificateId.toString(),
      credentialId: cert.credentialId,
      issueDate: cert.issueDate,
      notes: cert.notes || ""
    });
  };

  // Hủy chế độ sửa
  const handleCancelCert = () => {
    setEditingCertId(null);
    setCertForm({ certificateId: "", credentialId: "", issueDate: "", notes: "" });
  };

  // Lưu chứng chỉ (Thêm mới hoặc Cập nhật)
  const handleSaveCert = async () => {
    if (!user) return;
    
    // Validate cơ bản
    if (!certForm.certificateId || !certForm.credentialId || !certForm.issueDate) {
      toast.warning("Vui lòng nhập đủ Loại, Mã số và Ngày cấp.");
      return;
    }

    try {
      if (editingCertId) {
        // === LOGIC SỬA ===
        // Gọi API update: /api/users/{userId}/certificates/{certificateId}
        await userService.updateCertificateForUser(user.userId, editingCertId, {
          credentialId: certForm.credentialId,
          issueDate: certForm.issueDate,
          notes: certForm.notes
        });
        toast.success("Cập nhật chứng chỉ thành công!");
      } else {
        // === LOGIC THÊM MỚI ===
        // Gọi API add: /api/users/{userId}/certificates
        await userService.addCertificateToUser(user.userId, {
          certificateId: Number(certForm.certificateId),
          credentialId: certForm.credentialId,
          issueDate: certForm.issueDate,
          notes: certForm.notes
        });
        toast.success("Thêm chứng chỉ thành công!");
      }

      // Reset form và load lại list
      handleCancelCert();
      await loadUserCertificates(user.userId);

    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Lỗi khi lưu chứng chỉ. Kiểm tra lại thông tin.");
    }
  };

  // Xóa chứng chỉ
  const handleRemoveCert = async (certId: number) => {
    if (!user) return;
    if (!confirm("Bạn chắc chắn muốn xóa chứng chỉ này khỏi hồ sơ nhân viên?")) return;

    try {
      await userService.removeCertificateFromTech(user.userId, certId);
      toast.success("Đã xóa chứng chỉ");
      await loadUserCertificates(user.userId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi xóa chứng chỉ.");
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa người dùng: {user.fullName}</DialogTitle>
        </DialogHeader>

        {/* FORM USER INFO */}
        <form onSubmit={handleSubmit(onSubmitUser)} className="space-y-6">
          {/* Read-only info block */}
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

          {/* Editable fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Họ và tên</Label>
              <Input {...register("fullName")} />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input {...register("phoneNumber")} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Địa chỉ</Label>
              <Input {...register("address")} />
            </div>

            {/* Service Center Dropdown */}
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

          {/* --- KHỐI QUẢN LÝ CHỨNG CHỈ (Chỉ hiện nếu là Technician) --- */}
          {user.role === "TECHNICIAN" && (
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  Chứng chỉ
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full font-normal">
                    {userCertificates.length}
                  </span>
                </h3>
              </div>

              {/* Danh sách chứng chỉ hiện có */}
              <div className="space-y-2 mb-4 max-h-[180px] overflow-y-auto pr-1 border rounded p-2 bg-slate-50">
                {userCertificates.length === 0 && (
                  <p className="text-xs text-gray-400 italic text-center">Chưa có chứng chỉ nào.</p>
                )}
                {userCertificates.map((cert) => (
                  <div key={cert.certificateId} className="flex justify-between items-center bg-white p-2 rounded border text-sm shadow-sm">
                    <div>
                      <div className="font-medium text-blue-900">{cert.certificateName}</div>
                      <div className="text-xs text-gray-500">
                        Ngày cấp: {cert.issueDate} | Mã: {cert.credentialId}
                      </div>
                      {cert.notes && <div className="text-xs text-gray-400 italic">Note: {cert.notes}</div>}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button" variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:bg-blue-50"
                        onClick={() => handleEditCertClick(cert)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50"
                        onClick={() => handleRemoveCert(cert.certificateId)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Thêm / Sửa Chứng chỉ */}
              <div className="p-3 rounded border border-dashed bg-blue-50/50">
                <Label className="text-xs font-semibold mb-2 block text-blue-700">
                  {editingCertId ? "✏️ Đang chỉnh sửa chứng chỉ" : "➕ Thêm chứng chỉ mới"}
                </Label>
                <div className="grid grid-cols-12 gap-2 items-end">
                  {/* Dropdown Loại chứng chỉ */}
                  <div className="col-span-4">
                    <Select 
                      value={certForm.certificateId} 
                      onValueChange={(val) => setCertForm({ ...certForm, certificateId: val })}
                      // Khi đang sửa thì không cho đổi loại chứng chỉ (vì ID là khóa chính)
                      disabled={!!editingCertId}
                    >
                      <SelectTrigger className="h-8 text-xs bg-white">
                        <SelectValue placeholder="Loại chứng chỉ..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allCertificates.map(c => (
                          <SelectItem key={c.certificateId} value={c.certificateId.toString()}>
                            {c.certificateName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Input Mã số */}
                  <div className="col-span-3">
                    <Input
                      className="h-8 text-xs bg-white"
                      placeholder="Mã số (ABC-123)"
                      value={certForm.credentialId}
                      onChange={e => setCertForm({ ...certForm, credentialId: e.target.value })}
                    />
                  </div>

                  {/* Input Ngày cấp */}
                  <div className="col-span-3">
                    <Input
                      type="date"
                      className="h-8 text-xs bg-white"
                      value={certForm.issueDate}
                      onChange={e => setCertForm({ ...certForm, issueDate: e.target.value })}
                    />
                  </div>

                  {/* Nút Action */}
                  <div className="col-span-2 flex gap-1">
                    <Button type="button" size="sm" className="h-8 px-2 bg-blue-600 hover:bg-blue-700" onClick={handleSaveCert}>
                      {editingCertId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                    {editingCertId && (
                      <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-red-500" onClick={handleCancelCert}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                   <Input 
                      className="h-8 text-xs bg-white" 
                      placeholder="Ghi chú thêm (tùy chọn)..."
                      value={certForm.notes}
                      onChange={e => setCertForm({...certForm, notes: e.target.value})}
                   />
                </div>
              </div>
            </div>
          )}

          {/* Footer Dialog */}
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thông tin User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}