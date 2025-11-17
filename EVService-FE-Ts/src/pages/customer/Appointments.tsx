import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Calendar, Plus, Clock, MapPin } from "lucide-react";

import {
    useCustomerVehicles,
    useCustomerAppointments,
    useBookAppointment,
} from "@/services/appointmentService.ts";

export default function Appointments() {
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        vehicleId: "",
        serviceType: "",
        appointmentDate: "",
        appointmentTime: "",
        note: "",
        centerId: "",
        contractId: "",
    });

    const { data: vehicles } = useCustomerVehicles();
    const { data: appointments, isLoading } = useCustomerAppointments();
    const bookAppointmentMutation = useBookAppointment();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        bookAppointmentMutation.mutate(formData);
        setIsBookingDialogOpen(false);

        setFormData({
            vehicleId: "",
            serviceType: "",
            appointmentDate: "",
            appointmentTime: "",
            note: "",
            centerId: "",
            contractId: "",
        });
    };

    const getStatusColor = (status: string) => {
        const colors: any = {
            PENDING: "bg-accent/10 text-accent",
            CONFIRMED: "bg-secondary/10 text-secondary",
            IN_PROGRESS: "bg-primary/10 text-primary",
            COMPLETED: "bg-muted text-muted-foreground",
            CANCELLED: "bg-destructive/10 text-destructive",
        };
        return colors[status] || "bg-muted text-muted-foreground";
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Lịch hẹn</h2>
                    <p className="text-muted-foreground">
                        Quản lý lịch hẹn bảo dưỡng của bạn
                    </p>
                </div>

                {/* Button mở form */}
                <Dialog
                    open={isBookingDialogOpen}
                    onOpenChange={setIsBookingDialogOpen}
                >
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-primary shadow-glow">
                            <Plus className="w-4 h-4 mr-2" />
                            Đặt lịch mới
                        </Button>
                    </DialogTrigger>

                    {/* Form đặt lịch */}
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Đặt lịch hẹn</DialogTitle>
                            <DialogDescription>
                                Chọn xe và thời gian bảo dưỡng
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Chọn xe</Label>
                                    <Select
                                        value={formData.vehicleId}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, vehicleId: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn xe" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vehicles?.map((v: any) => (
                                                <SelectItem key={v.id} value={v.vehicleId}>
                                                    {v.model} - {v.licensePlate}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Loại dịch vụ</Label>
                                    <Select
                                        value={formData.serviceType}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, serviceType: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn dịch vụ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PERIODIC_MAINTENANCE">
                                                Bảo dưỡng định kỳ
                                            </SelectItem>
                                            <SelectItem value="Sửa chữa">Sửa chữa</SelectItem>
                                            <SelectItem value="INSPECTION">
                                                Kiểm tra tổng quát
                                            </SelectItem>
                                            <SelectItem value="BATTERY_CHECK">
                                                Kiểm tra pin
                                            </SelectItem>
                                            <SelectItem value="SOFTWARE_UPDATE">
                                                Cập nhật phần mềm
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Ngày + Giờ */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Ngày</Label>
                                        <Input
                                            type="date"
                                            value={formData.appointmentDate}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    appointmentDate: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label>Giờ</Label>
                                        <Input
                                            type="time"
                                            value={formData.appointmentTime}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    appointmentTime: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Ghi chú</Label>
                                    <Textarea
                                        value={formData.note}
                                        rows={3}
                                        onChange={(e) =>
                                            setFormData({ ...formData, note: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="submit"
                                    className="bg-gradient-primary"
                                    disabled={bookAppointmentMutation.isPending}
                                >
                                    {bookAppointmentMutation.isPending
                                        ? "Đang đặt..."
                                        : "Đặt lịch hẹn"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Danh sách lịch hẹn */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="shadow-card">
                            <CardContent className="pt-6">
                                <div className="h-24 bg-muted animate-pulse rounded-lg" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : appointments?.length > 0 ? (
                <div className="space-y-4">
                    {appointments.map((appointment: any) => (
                        <Card key={appointment.id} className="shadow-card">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">

                                        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-white" />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-lg">
                                                    {appointment.serviceType}
                                                </h3>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                                                        appointment.status
                                                    )}`}
                                                >
                          {getStatusText(appointment.status)}
                        </span>
                                            </div>

                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span>
                            {new Date(
                                appointment.appointmentDate
                            ).toLocaleString("vi-VN")}
                          </span>
                                                </div>

                                                {appointment.serviceCenter && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{appointment.serviceCenter.name}</span>
                                                    </div>
                                                )}

                                                {appointment.note && (
                                                    <p className="mt-2">{appointment.note}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {appointment.status === "PENDING" && (
                                        <Button variant="outline" size="sm">
                                            Hủy lịch
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="shadow-card">
                    <CardContent className="py-12 text-center">
                        <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">Chưa có lịch hẹn nào</h3>
                        <Button
                            className="mt-4 bg-gradient-primary"
                            onClick={() => setIsBookingDialogOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Đặt lịch ngay
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
