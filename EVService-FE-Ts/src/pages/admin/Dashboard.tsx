import { useEffect, useState, useCallback } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Wrench,
    Briefcase,
    DollarSign,
    Calendar,
    Activity,
    Clock,
    TrendingUp,
    Package,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import api from "../../services/api"; // KHẮC PHỤC: Sử dụng đường dẫn tương đối tối ưu nhất
import { toast } from "sonner";
import { format, isToday, isThisWeek, isThisMonth } from "date-fns";

// --- INTERFACE MỚI CHO TÍNH AN TOÀN KIỂU DỮ LIỆU ---

interface User {
    userId: number;
    role: 'CUSTOMER' | 'STAFF' | 'TECHNICIAN' | 'ADMIN';
    // ...
}

interface Appointment {
    appointmentId: number;
    status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
    createdAt?: string;
    appointmentDate: string;
    appointmentTime: string;
    customerName: string;
    serviceType: string;
    // ...
}

interface ServiceTicket {
    ticketId: number;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
    endTime?: string;
    startTime: string;
    // Giả định cấu trúc lineTotal cho item và part
    items?: { lineTotal?: number }[];
    parts?: { lineTotal?: number }[];
    // ...
}

interface Part {
    partId: number;
    quantityInStock?: number;
    // ...
}

interface RevenueStat {
    revenueToday: number;
    revenueWeek: number;
    revenueMonth: number;
    totalRevenue: number;

    pendingAppointments: number;
    lowStockCount: number;

    totalCustomers: number;
    totalStaff: number;
    totalTechnicians: number;
}

interface ChartDataItem {
    name: string;
    total: number;
}

// --- COMPONENT CHÍNH ---

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<RevenueStat>({
        revenueToday: 0,
        revenueWeek: 0,
        revenueMonth: 0,
        totalRevenue: 0,

        pendingAppointments: 0,
        lowStockCount: 0,

        totalCustomers: 0,
        totalStaff: 0,
        totalTechnicians: 0,
    });

    // ĐÃ SỬA: Thay thế any[] bằng interface cụ thể
    const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
    const [revenueData, setRevenueData] = useState<ChartDataItem[]>([]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [usersRes, ticketsRes, appointmentsRes, partsRes] = await Promise.all([
                // ĐÃ SỬA: Sử dụng interface cho response
                api.get<User[]>("/api/users"),
                api.get<ServiceTicket[]>("/api/service-tickets"),
                api.get<Appointment[]>("/api/appointments"),
                api.get<Part[]>("/api/parts"),
            ]);

            // 1. Xử lý User
            const users = usersRes.data;

            // 2. Xử lý Doanh thu (Tickets)
            const tickets = ticketsRes.data;
            let revToday = 0;
            let revWeek = 0;
            let revMonth = 0;
            let revTotal = 0;

            // Mảng doanh thu theo tháng (cho biểu đồ)
            const currentMonthIndex = new Date().getMonth();
            const revenueByMonth = new Array(12).fill(0);

            // ĐÃ SỬA: Loại bỏ t: any
            tickets.forEach((t) => {
                // Chỉ tính tiền khi ticket đã hoàn thành
                if (t.status === "COMPLETED") {
                    // Tính tổng tiền từ items và parts
                    // ĐÃ SỬA: Loại bỏ sum: number, i: any
                    const itemsTotal = t.items?.reduce((sum, i) => sum + (i.lineTotal || 0), 0) || 0;
                    // ĐÃ SỬA: Loại bỏ sum: number, p: any
                    const partsTotal = t.parts?.reduce((sum, p) => sum + (p.lineTotal || 0), 0) || 0;
                    const cost = itemsTotal + partsTotal;

                    // Ngày ghi nhận doanh thu (dùng endTime hoặc startTime)
                    const ticketDate = new Date(t.endTime || t.startTime);

                    // Cộng dồn tổng
                    revTotal += cost;

                    // Phân loại theo thời gian thực
                    if (isToday(ticketDate)) revToday += cost;
                    if (isThisWeek(ticketDate)) revWeek += cost;
                    if (isThisMonth(ticketDate)) revMonth += cost;

                    // Dữ liệu biểu đồ
                    revenueByMonth[ticketDate.getMonth()] += cost;
                }
            });

            // 3. Xử lý Lịch hẹn
            const appointments = appointmentsRes.data;
            // ĐÃ SỬA: Loại bỏ any
            const recentAppts = [...appointments]
                .sort((a, b) => new Date(b.createdAt || b.appointmentDate).getTime() - new Date(a.createdAt || a.appointmentDate).getTime())
                .slice(0, 5);

            // 4. Xử lý Tồn kho
            const parts = partsRes.data;
            // ĐÃ SỬA: Loại bỏ p: any
            const lowStock = parts.filter((p) => (p.quantityInStock || 0) <= 10).length;

            // Update State
            setStats({
                revenueToday: revToday,
                revenueWeek: revWeek,
                revenueMonth: revMonth,
                totalRevenue: revTotal,

                // ĐÃ SỬA: Loại bỏ a: any
                pendingAppointments: appointments.filter((a) => a.status === "PENDING").length,
                lowStockCount: lowStock,

                // ĐÃ SỬA: Loại bỏ u: any
                totalCustomers: users.filter((u) => u.role === "CUSTOMER").length,
                totalStaff: users.filter((u) => u.role === "STAFF").length,
                totalTechnicians: users.filter((u) => u.role === "TECHNICIAN").length,
            });

            // Format dữ liệu biểu đồ (6 tháng gần nhất)
            const chartData = revenueByMonth.map((amount, index) => ({
                name: `Tháng ${index + 1}`,
                total: amount,
            })).slice(Math.max(0, currentMonthIndex - 5), currentMonthIndex + 1);

            setRevenueData(chartData);
            setRecentAppointments(recentAppts);

        } catch (error) {
            console.error("Dashboard fetch error:", error);
            toast.error("Lỗi tải dữ liệu Dashboard");
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        // Gọi hàm fetchData và xử lý Promise, giải quyết cảnh báo ESLint
        fetchData();
    }, [fetchData]);

    // Helper format tiền tệ
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    if (loading) {
        return <div className="flex h-96 items-center justify-center">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Tổng quan</h2>
                <p className="text-muted-foreground">
                    Trung tâm chỉ huy và giám sát hoạt động hệ thống.
                </p>
            </div>

            {/* --- PHẦN 1: HIỆU SUẤT KINH DOANH (REVENUE) --- */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Hiệu suất Kinh doanh</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Doanh thu Hôm nay</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.revenueToday)}</div>
                            <p className="text-xs text-muted-foreground">Cập nhật theo thời gian thực</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Tuần này</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.revenueWeek)}</div>
                            <p className="text-xs text-muted-foreground">Từ thứ 2 đến hiện tại</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Tháng này</CardTitle>
                            <Calendar className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.revenueMonth)}</div>
                            <p className="text-xs text-muted-foreground">Tổng doanh thu tháng hiện tại</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-primary">Tổng Doanh thu</CardTitle>
                            <Activity className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">{formatCurrency(stats.totalRevenue)}</div>
                            <p className="text-xs text-primary/80">Toàn thời gian</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* --- PHẦN 2: CHỈ SỐ VẬN HÀNH & NHÂN SỰ --- */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Cảnh báo kho */}
                <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Cảnh báo Kho</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-red-500" />
                            <span className="text-2xl font-bold text-red-600">{stats.lowStockCount}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Mặt hàng sắp hết</p>
                    </CardContent>
                </Card>

                {/* Thống kê Staff */}
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Nhân viên (Staff)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-blue-500" />
                            <span className="text-2xl font-bold">{stats.totalStaff}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Đang hoạt động</p>
                    </CardContent>
                </Card>

                {/* Thống kê Technician */}
                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Kỹ thuật viên</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Wrench className="h-5 w-5 text-orange-500" />
                            <span className="text-2xl font-bold">{stats.totalTechnicians}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Đang hoạt động</p>
                    </CardContent>
                </Card>

                {/* Thống kê Khách hàng */}
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Khách hàng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-green-500" />
                            <span className="text-2xl font-bold">{stats.totalCustomers}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Đã đăng ký</p>
                    </CardContent>
                </Card>
            </div>

            {/* --- PHẦN 3: BIỂU ĐỒ & DANH SÁCH --- */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Biểu đồ */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Biểu đồ Tăng trưởng</CardTitle>
                        <CardDescription>Doanh thu 6 tháng gần nhất</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value / 1000000}M`}
                                />
                                <Tooltip
                                    // Sử dụng formatCurrency đã định nghĩa
                                    formatter={(value: number) => formatCurrency(value)}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Danh sách lịch hẹn mới nhất (View Only) */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            Lịch hẹn mới nhất
                            <Badge variant="secondary">{stats.pendingAppointments} Chờ xử lý</Badge>
                        </CardTitle>
                        <CardDescription>
                            Danh sách 5 lịch hẹn vừa được đặt. Staff sẽ xử lý các lịch này.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Khách hàng</TableHead>
                                    <TableHead>Dịch vụ</TableHead>
                                    <TableHead className="text-right">Trạng thái</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentAppointments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">Chưa có lịch hẹn nào</TableCell>
                                    </TableRow>
                                ) : (
                                    recentAppointments.map((appt) => (
                                        <TableRow key={appt.appointmentId}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{appt.customerName}</span>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                                                        {format(new Date(appt.appointmentDate), "dd/MM")} - {appt.appointmentTime}
                          </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">{appt.serviceType}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge
                                                    variant={appt.status === "PENDING" ? "destructive" : "outline"}
                                                    className={appt.status === "PENDING" ? "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100" : ""}
                                                >
                                                    {appt.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}