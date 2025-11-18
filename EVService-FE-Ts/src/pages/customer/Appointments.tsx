import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar, Plus, Clock, MapPin, Loader2 } from "lucide-react";

// Import types và hooks mới cập nhật
import {
    useCustomerVehicles,
    useCustomerAppointments,
    useBookAppointment,
    useServicePackages,
    useCancelAppointment,
    VehicleDto,       
    ServicePackageDto,
    AppointmentDto
} from "@/services/appointmentService.ts";

export default function Appointments() {
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        vehicleId: "",
        serviceType: "",
        appointmentDate: "",
        appointmentTime: "",
        note: "",
    });

    const { data: vehicles, isLoading: isLoadingVehicles } = useCustomerVehicles();
    const { data: appointments, isLoading: isLoadingAppointments } = useCustomerAppointments();
    const { data: servicePackages, isLoading: isLoadingPackages } = useServicePackages();
    
    const bookAppointmentMutation = useBookAppointment();
    const cancelAppointmentMutation = useCancelAppointment();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        bookAppointmentMutation.mutate(formData, {
            onSuccess: () => {
                setIsBookingDialogOpen(false);
                setFormData({
                    vehicleId: "",
                    serviceType: "",
                    appointmentDate: "",
                    appointmentTime: "",
                    note: "",
                });
            }
        });
    };

    const handleCancel = (appointmentId: number) => {
        if (window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này không?")) {
            cancelAppointmentMutation.mutate(appointmentId);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: any = {
            PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
            CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
            IN_PROGRESS: "bg-purple-100 text-purple-700 border-purple-200",
            COMPLETED: "bg-green-100 text-green-700 border-green-200",
            CANCELLED: "bg-red-100 text-red-700 border-red-200",
        };
        return colors[status] || "bg-gray-100 text-gray-700";
    };

    const getStatusText = (status: string) => {
        const texts: any = {
            PENDING: "Chờ xác nhận",
            CONFIRMED: "Đã xác nhận",
            IN_PROGRESS: "Đang bảo dưỡng",
            COMPLETED: "Hoàn thành",
            CANCELLED: "Đã hủy",
        };
        return texts[status] || status;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Lịch hẹn</h2>
                    <p className="text-muted-foreground">Quản lý lịch hẹn bảo dưỡng của bạn</p>
                </div>

                <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#007AFF] hover:bg-[#0066CC] shadow-lg shadow-blue-500/20">
                            <Plus className="w-4 h-4 mr-2" />
                            Đặt lịch mới
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Đặt lịch hẹn</DialogTitle>
                            <DialogDescription>Chọn xe và gói dịch vụ để đặt lịch bảo dưỡng</DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 py-4">
                                {/* SELECT XE: Sử dụng vehicleId */}
                                <div className="space-y-2">
                                    <Label>Chọn xe</Label>
                                    <Select
                                        value={formData.vehicleId}
                                        onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
                                        disabled={isLoadingVehicles}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingVehicles ? "Đang tải..." : "Chọn xe của bạn"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vehicles && vehicles.length > 0 ? (
                                                vehicles.map((v: VehicleDto) => (
                                                    // FIX: Sử dụng v.vehicleId thay vì v.id
                                                    <SelectItem key={v.vehicleId} value={v.vehicleId.toString()}>
                                                        {v.model} - {v.licensePlate}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-2 text-sm text-muted-foreground">Bạn chưa đăng ký xe nào</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* SELECT DỊCH VỤ: Sử dụng packageName làm value */}
                                <div className="space-y-2">
                                    <Label>Loại dịch vụ</Label>
                                    <Select
                                        value={formData.serviceType}
                                        onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                                        disabled={isLoadingPackages}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingPackages ? "Đang tải..." : "Chọn gói dịch vụ"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {servicePackages && servicePackages.length > 0 ? (
                                                servicePackages.map((pkg: ServicePackageDto) => (
                                                    // FIX: Sử dụng pkg.packageId cho key
                                                    <SelectItem key={pkg.packageId} value={pkg.packageName}>
                                                        {pkg.packageName}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="MAINTENANCE">Bảo dưỡng định kỳ</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Ngày</Label>
                                        <Input
                                            type="date"
                                            value={formData.appointmentDate}
                                            min={new Date().toISOString().split("T")[0]}
                                            onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Giờ</Label>
                                        <Input
                                            type="time"
                                            value={formData.appointmentTime}
                                            onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Ghi chú (Tùy chọn)</Label>
                                    <Textarea
                                        value={formData.note}
                                        rows={3}
                                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit" className="bg-[#007AFF]" disabled={bookAppointmentMutation.isPending}>
                                    {bookAppointmentMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Đặt lịch hẹn"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoadingAppointments ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="shadow-sm border-gray-100"><CardContent className="pt-6"><div className="h-24 bg-gray-100 animate-pulse rounded-lg" /></CardContent></Card>
                    ))}
                </div>
            ) : appointments?.length > 0 ? (
                <div className="space-y-4">
                    {appointments.map((appointment: AppointmentDto) => (
                        // FIX QUAN TRỌNG: Dùng appointment.appointmentId làm key
                        <Card key={appointment.appointmentId} className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                            <Calendar className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-lg text-gray-900">{appointment.serviceType}</h3>
                                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getStatusColor(appointment.status)}`}>
                                                    {getStatusText(appointment.status)}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500 space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{appointment.appointmentTime} - {new Date(appointment.appointmentDate).toLocaleDateString("vi-VN")}</span>
                                                </div>
                                                {appointment.centerId && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>Trung tâm số {appointment.centerId}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {appointment.status === "PENDING" && (
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                            // FIX QUAN TRỌNG: Truyền appointmentId vào hàm hủy
                                            onClick={() => handleCancel(appointment.appointmentId)}
                                            disabled={cancelAppointmentMutation.isPending}
                                        >
                                            {cancelAppointmentMutation.isPending ? "Đang hủy..." : "Hủy lịch"}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="shadow-sm border-dashed border-2 border-gray-200 bg-gray-50/50">
                    <CardContent className="py-12 text-center">
                        <h3 className="text-lg font-semibold text-gray-900">Chưa có lịch hẹn nào</h3>
                        <Button className="mt-4 bg-[#007AFF]" onClick={() => setIsBookingDialogOpen(true)}>
                            Đặt lịch ngay
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}