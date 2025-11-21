import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/services/userService";
import { serviceCenterService, ServiceCenter } from "@/services/serviceCenterService";
import { certificateService, Certificate } from "@/services/certificateService";

// --- SCHEMA VALIDATION ---
// Schema cơ bản cho mọi user
const baseSchema = z.object({
  username: z.string().min(3, "Username tối thiểu 3 ký tự"),
  fullName: z.string().min(2, "Họ tên là bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  phoneNumber: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "SĐT không hợp lệ").optional().or(z.literal("")),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
});

// Schema cho nhân viên (cần thêm CenterId)
const employeeSchema = baseSchema.extend({
  centerId: z.string().min(1, "Vui lòng chọn cơ sở làm việc"),
});

// Schema chi tiết cho chứng chỉ
const certItemSchema = z.object({
  certificateId: z.string().min(1, "Chọn loại chứng chỉ"),
  credentialId: z.string().min(1, "Nhập mã số"),
  issueDate: z.string().min(1, "Nhập ngày cấp"),
  notes: z.string().optional(),
});

// Schema cho Kỹ thuật viên (Kế thừa nhân viên + mảng chứng chỉ)
const techSchema = employeeSchema.extend({
  certificates: z.array(certItemSchema).optional(),
});

export function CreateUserDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"CUSTOMER" | "STAFF" | "TECHNICIAN">("CUSTOMER");
  const [isLoading, setIsLoading] = useState(false);
  
  // Dữ liệu danh mục từ API
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
    const [certTypes, setCertTypes] = useState<Certificate[]>([]);
  // Khởi tạo Form
  const form = useForm<z.infer<typeof techSchema>>({
    resolver: zodResolver(
      activeTab === "CUSTOMER" ? baseSchema 
      : activeTab === "STAFF" ? employeeSchema 
      : techSchema
    ),
    defaultValues: {
      username: "", fullName: "", email: "", phoneNumber: "", password: "",
      centerId: "",
      certificates: [],
    },
  });

  // Hook quản lý mảng chứng chỉ động
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "certificates",
  });

  // Load dữ liệu danh mục khi mở dialog
  useEffect(() => {
    if (open) {
      serviceCenterService.getAllServiceCenters().then(setCenters).catch(console.error);
      certificateService.getAllCertificates().then(setCertTypes).catch(console.error);
    }
  }, [open]);

  // Hàm reset form khi đổi tab
  const handleTabChange = (val: string) => {
    setActiveTab(val as any);
    form.reset({
        username: form.getValues("username"),
        fullName: form.getValues("fullName"),
        email: form.getValues("email"),
        phoneNumber: form.getValues("phoneNumber"),
        password: form.getValues("password"),
        centerId: "",
        certificates: []
    });
  };

  // --- XỬ LÝ SUBMIT ---
  async function onSubmit(values: z.infer<typeof techSchema>) {
    setIsLoading(true);
    try {
      const commonData = {
        username: values.username,
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phoneNumber: values.phoneNumber,
        role: activeTab,
      };

      // CASE 1: TẠO KHÁCH HÀNG
      if (activeTab === "CUSTOMER") {
        await userService.createCustomer(commonData);
        toast.success("Đã tạo Khách hàng thành công!");
      } 
      // CASE 2: TẠO NHÂN VIÊN (STAFF)
      else if (activeTab === "STAFF") {
        await userService.createStaff({
          ...commonData,
          centerId: Number(values.centerId),
        });
        toast.success("Đã tạo Nhân viên thành công!");
      } 
      // CASE 3: TẠO KỸ THUẬT VIÊN (TECHNICIAN) - 2 BƯỚC
      else if (activeTab === "TECHNICIAN") {
        // B1: Tạo User
        const res = await userService.createTechnician({
          ...commonData,
          centerId: Number(values.centerId),
        });
        
        // Lấy userId từ response (Backend trả về DTO có userId)
        const newUserId = res?.userId || res?.id;

        // B2: Thêm chứng chỉ (nếu có nhập)
        if (newUserId && values.certificates && values.certificates.length > 0) {
            await Promise.all(values.certificates.map(cert => {
               return userService.addCertificateToUser(newUserId, {
                  certificateId: Number(cert.certificateId),
                  credentialId: cert.credentialId,
                  issueDate: cert.issueDate,
                  notes: cert.notes || ""
               });
            }));
            toast.success(`Đã tạo KTV và thêm ${values.certificates.length} chứng chỉ!`);
        } else {
            toast.success("Đã tạo KTV (chưa có chứng chỉ)!");
        }
      }

      setOpen(false);
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || error.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-white shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Thêm mới
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm người dùng mới</DialogTitle>
          <DialogDescription>Chọn vai trò và nhập thông tin tương ứng.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            {/* <TabsTrigger value="CUSTOMER">Khách hàng</TabsTrigger> */}
            <TabsTrigger value="STAFF">Nhân viên</TabsTrigger>
            <TabsTrigger value="TECHNICIAN">Kỹ thuật viên</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* --- NHÓM THÔNG TIN CHUNG (2 cột) --- */}
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="username" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tài khoản <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input placeholder="user123" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ tên <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input placeholder="Nguyễn Văn A" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input placeholder="email@vidu.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl><Input placeholder="0909..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input type="password" placeholder="**********" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* --- PHẦN RIÊNG CHO STAFF/TECHNICIAN: CHỌN CƠ SỞ --- */}
              {(activeTab === "STAFF" || activeTab === "TECHNICIAN") && (
                <div className="p-4 bg-slate-50 rounded-lg border">
                    <FormField control={form.control} name="centerId" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Cơ sở làm việc <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Chọn cơ sở..." /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {centers.map((c) => (
                            <SelectItem key={c.centerId} value={c.centerId.toString()}>
                              {c.centerName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )} />
                </div>
              )}

              {/* --- PHẦN RIÊNG CHO TECHNICIAN: CHỨNG CHỈ (DYNAMIC FORM) --- */}
              {activeTab === "TECHNICIAN" && (
                <div className="border rounded-lg p-4 bg-slate-50 space-y-3">
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-base font-semibold text-blue-700">Hồ sơ chứng chỉ</FormLabel>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => append({ certificateId: "", credentialId: "", issueDate: "", notes: "" })}
                    >
                      <Plus className="w-3 h-3 mr-1" /> Thêm dòng
                    </Button>
                  </div>

                  {fields.length === 0 && (
                    <p className="text-sm text-muted-foreground italic text-center py-2">
                        Chưa có chứng chỉ nào. Nhấn "Thêm dòng" để nhập.
                    </p>
                  )}

                  <div className="max-h-[200px] overflow-y-auto pr-2 space-y-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 gap-2 items-end bg-white p-2 rounded border shadow-sm">
                        
                        {/* Loại chứng chỉ */}
                        <div className="col-span-4">
                            <FormField control={form.control} name={`certificates.${index}.certificateId`} render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] uppercase text-muted-foreground">Loại</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Chọn loại" />

                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {certTypes.map((ct: any) => (
                                      <SelectItem key={ct.certificateId} value={ct.certificateId.toString()}>
                                        {ct.certificateName}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            </FormItem>
                            )} />
                        </div>

                        {/* Mã số */}
                        <div className="col-span-3">
                            <FormField control={form.control} name={`certificates.${index}.credentialId`} render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] uppercase text-muted-foreground">Mã số</FormLabel>
                                <FormControl>
                                    <Input {...field} className="h-8 text-xs" placeholder="ABC-123" />
                                </FormControl>
                            </FormItem>
                            )} />
                        </div>

                        {/* Ngày cấp */}
                        <div className="col-span-4">
                            <FormField control={form.control} name={`certificates.${index}.issueDate`} render={({ field }) => (
                            <FormItem className="space-y-1">
                                <FormLabel className="text-[10px] uppercase text-muted-foreground">Ngày cấp</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} className="h-8 text-xs" />
                                </FormControl>
                            </FormItem>
                            )} />
                        </div>

                        {/* Nút Xóa */}
                        <div className="col-span-1 flex justify-end pb-1">
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => remove(index)}>
                            <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                        </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu người dùng
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}