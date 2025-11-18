import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth";
import { Calendar, Info, User, Car, MapPin, Loader2 } from "lucide-react";
import { technicianService, Appointment, AppointmentDetailData } from "@/services/appointmentTechinicianService.ts";

export default function TechnicianMyAppointments() {
    const { toast } = useToast();
    const currentUser = authService.getCurrentUser();

    // State danh sách
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    // State lưu toàn bộ object của appontment đang chọn
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    // State cho Dialog chi tiết
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [details, setDetails] = useState<AppointmentDetailData | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    useEffect(() => {
        if (currentUser?.id) fetchAppointments();
    }, [currentUser?.id]);

    const fetchAppointments = async () => {
        try {
            const data = await technicianService.getMyAppointments(currentUser?.id);
            setAppointments(data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to load list", variant: "destructive" });
        }
    };

    // Hàm xử lý khi bấm "View Details"
    const handleViewDetails = async (appt: Appointment) => {
        setSelectedId(appt.appointmentId);
        setSelectedAppointment(appt);
        setDetails(null);
        setIsLoadingDetails(true);

        try {
            const data = await technicianService.getAppointmentDetails(
                appt.customerId,
                appt.vehicleId,
            );
            setDetails(data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to load details", variant: "destructive" });
            setSelectedId(null);
            setSelectedAppointment(null);
        } finally {
            setIsLoadingDetails(false);
        }
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

    const statusColors: Record<string, string> = {
        CONFIRMED: "bg-blue-500",
        CHECKED_IN: "bg-orange-500",
        IN_PROGRESS: "bg-yellow-500",
        COMPLETED: "bg-green-500",
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">LỊCH HẸN</h2>

            {/* DANH SÁCH LỊCH ĐƯỢC PHÂN CÔNG */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {appointments.map((appt) => (
                    <Card key={appt.appointmentId} className="hover:shadow-md flex flex-col h-full">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{appt.serviceType}</CardTitle>
                                <Badge className={statusColors[appt.status]}>{getStatusText(appt.status)}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {new Date(appt.appointmentDate).toLocaleString()}
                            </div>
                            {appt.note && (
                                <p className="text-muted-foreground italic line-clamp-2">
                                    Note: "{appt.note}"
                                </p>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" onClick={() => handleViewDetails(appt)}>
                                <Info className="mr-2 h-4 w-4" /> Xem chi tiết & tạo phiếu dịch vụ
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* DIALOG CHI TIẾT */}
            <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Chi tiết lịch hẹn</DialogTitle>
                        <DialogDescription>Thông tin khách hàng và xe</DialogDescription>
                    </DialogHeader>

                    {isLoadingDetails ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : details && selectedAppointment ? (
                        <div className="space-y-4">
                            {/* Thông tin Khách hàng */}
                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                <User className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-semibold">{details.user.fullName}</p>
                                    <p className="text-sm text-muted-foreground">Số điện thoại: {details.user.phoneNumber}</p>
                                </div>
                            </div>

                            {/* Thông tin Xe */}
                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                <Car className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-semibold">{details.vehicle.brand} {details.vehicle.model}</p>
                                    <p className="text-sm text-muted-foreground">Biển số xe: {details.vehicle.licensePlate}</p>
                                </div>
                            </div>

                            {/* ghi chú của khách hàng */}
                            <div className="flex flex-col gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/20">
                                <p className="font-semibold text-blue-700 dark:text-blue-300 shrink-0">
                                    Ghi chú của khách hàng:
                                </p>

                                {/* Thay đổi quan trọng ở đây: */}
                                <div className="max-h-[100px] w-full overflow-y-auto rounded border border-blue-200 bg-white p-2 dark:bg-black/20">
                                    <p className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-wrap break-all">
                                        {selectedAppointment.note}
                                    </p>
                                </div>
                            </div>

                            {/* Các nút hành động*/}
                            <div className="pt-4 flex gap-2">
                                <Button className="flex-1">Tạo phiếu dịch vụ</Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-red-500">Lỗi khi tải chi tiết.</p>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}