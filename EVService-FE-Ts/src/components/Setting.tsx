import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    User as UserIcon, Mail, Phone, MapPin, Lock, Save, X, Edit2, Camera, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter,
} from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth";
import { userService, UserProfile, UpdateProfile, PasswordChangeForm } from "@/services/userService";
import { toast } from "sonner";


// ==========================================
// . COMPONENT CON: DIALOG ĐỔI MẬT KHẨU
// ==========================================
const PasswordChangeDialog = () => {
    const [isOpen, setIsOpen] = useState(false);

    const [passData, setPassData] = useState<PasswordChangeForm>({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });


    //~ API CALl: Đổi mật khẩu
    const changePassMutation = useMutation({
        mutationFn: (data: PasswordChangeForm) => userService.changePassword(data),

        onSuccess: () => {
            toast.success("Đổi mật khẩu thành công!")
            setIsOpen(false);
            setPassData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            })
        },

        onError: (error: any) => {
            const msg = error?.res?.data?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại";
            toast.error(msg);
        }
    });

    const handleSubmit = () => {
        if (!passData.oldPassword || !passData.newPassword || !passData.confirmPassword) {
            toast.warning("Vui lòng điền đầy đủ các trường.");
            return;
        }
        if (passData.newPassword !== passData.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp!");
            return;
        }
        if (passData.newPassword.length < 6) {
            toast.warning("Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }

        changePassMutation.mutate(passData);
    };

return (
<Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <Lock className="w-4 h-4 mr-2" />
          Đổi mật khẩu
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Đổi mật khẩu</DialogTitle>
          <DialogDescription>
            Nhập mật khẩu hiện tại và mật khẩu mới để bảo vệ tài khoản.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="old-pass">Mật khẩu hiện tại</Label>
            <Input 
              id="old-pass" type="password" 
              value={passData.oldPassword}
              onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-pass">Mật khẩu mới</Label>
            <Input 
              id="new-pass" type="password" 
              value={passData.newPassword}
              onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-pass">Xác nhận mật khẩu mới</Label>
            <Input 
              id="confirm-pass" type="password" 
              value={passData.confirmPassword}
              onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={changePassMutation.isPending}>
            {changePassMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


// ==========================================
//. COMPONENT CHÍNH: SETTING PAGE
// ==========================================
export default function Setting() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile | null>(null);

  // API Call: Lấy thông tin profile
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["user-profile"],
    queryFn: userService.getProfile,
  });

  // Đồng bộ dữ liệu từ API vào Form State khi tải xong
  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  // API Call: Cập nhật profile
  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfile) => userService.updateProfile(data),
    onSuccess: (updatedData) => {
      toast.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
      // Cập nhật cache để giao diện hiển thị dữ liệu mới ngay lập tức
      queryClient.setQueryData(["user-profile"], updatedData); 
    },
    onError: () => {
      toast.error("Cập nhật thất bại. Vui lòng thử lại sau.");
    }
  });

  const handleSave = () => {
    if (!formData) return;
    
    // Mapping dữ liệu từ form sang đúng format API yêu cầu (UpdateProfile)
    const payload: UpdateProfile = {
      fullName: formData.fullName,
      address: formData.address,
      phoneNumber: formData.phoneNumber
    };
    updateMutation.mutate(payload);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form về dữ liệu gốc
    if (profile) setFormData(profile);
  };

  // Render Loading state
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render Error state
  if (isError || !formData) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-destructive">
        <p>Không thể tải thông tin người dùng.</p>
        <Button variant="link" onClick={() => window.location.reload()}>Thử lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Cài đặt tài khoản</h3>
        <p className="text-muted-foreground">
          Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.
        </p>
      </div>

      {/* --- PHẦN 1: THÔNG TIN CÁ NHÂN --- */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Thông tin hồ sơ</CardTitle>
              <CardDescription>Thông tin liên hệ cơ bản.</CardDescription>
            </div>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Hàng 1: Username & Email (READ-ONLY) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <UserIcon className="w-4 h-4" /> Tên đăng nhập
              </Label>
              <Input value={formData.username} disabled className="bg-muted/50 font-semibold" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" /> Email
              </Label>
              <Input value={formData.email} disabled className="bg-muted/50 font-semibold" />
            </div>
          </div>

          {/* Hàng 2: Họ tên & SĐT (EDITABLE) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input 
                id="fullName"
                value={formData.fullName} 
                disabled={!isEditing}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className={isEditing ? "bg-background" : "bg-muted/20"}
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> Số điện thoại
              </Label>
              <Input 
                id="phone"
                value={formData.phoneNumber || ""} 
                disabled={!isEditing}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className={isEditing ? "bg-background" : "bg-muted/20"}
              />
            </div>
          </div>

          {/* Hàng 3: Địa chỉ (EDITABLE - Textarea) */}
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Địa chỉ
            </Label>
            <Textarea 
              id="address"
              value={formData.address || ""} 
              disabled={!isEditing}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className={`min-h-[80px] resize-none ${isEditing ? "bg-background" : "bg-muted/20"}`}
            />
          </div>
        </CardContent>

        {/* Footer: Chỉ hiện nút Lưu khi đang Edit */}
        {isEditing && (
          <CardFooter className="flex justify-end gap-2 border-t bg-muted/5 py-4">
            <Button variant="ghost" onClick={handleCancel} disabled={updateMutation.isPending}>
              <X className="w-4 h-4 mr-2" /> Hủy bỏ
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Lưu thay đổi
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* --- PHẦN 2: BẢO MẬT --- */}
      <Card>
        <CardHeader>
          <CardTitle>Bảo mật</CardTitle>
          <CardDescription>Quản lý mật khẩu và bảo vệ tài khoản.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/10">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-background rounded-full border shadow-sm">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Mật khẩu</p>
                <p className="text-sm text-muted-foreground">Nên thay đổi mật khẩu định kỳ để bảo mật.</p>
              </div>
            </div>
            {/* Nút mở Dialog đổi mật khẩu */}
            <PasswordChangeDialog />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}