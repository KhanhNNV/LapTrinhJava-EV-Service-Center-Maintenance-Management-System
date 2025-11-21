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
import api from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { isToday, isThisWeek, isThisMonth } from "date-fns";

// --- INTERFACES ---

interface User {
    userId: number;
    role: 'CUSTOMER' | 'STAFF' | 'TECHNICIAN' | 'ADMIN';
    fullName?: string;
}

interface Appointment {
    appointmentId: number;
    status: string;
    createdAt?: string;
    appointmentDate: string;
    appointmentTime: string;
    customerName: string;
    serviceType: string;
}

interface ServiceTicket {
    ticketId: number;
    status: string;
    endTime?: string;
    startTime: string;
    items?: { lineTotal?: number }[];
    parts?: { lineTotal?: number }[];
    totalCost?: number;
}

interface Part {
    partId: number;
    quantityInStock?: number;
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

interface Inventory {
    inventoryId: number;
    partName: string;
    quantity: number;
    minQuantity: number; // Quan trọng: Phải có trường này
}

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

    const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
    const [revenueData, setRevenueData] = useState<{ name: string; total: number }[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Dùng Promise.allSettled để tránh sập toàn trang nếu 1 API lỗi
            const results = await Promise.allSettled([
                // 1. GỌI ENDPOINT MỚI CỦA BẠN (Trả về List)
                api.get("/api/users/all"),

                // Các endpoint khác giữ nguyên tham số size lớn để lấy hết data
                api.get("/api/service-tickets", { params: { size: 1000 } }),
                api.get("/api/appointments", { params: { size: 1000 } }),
                api.get("/api/parts", { params: { size: 1000 } }),
                api.get("/api/inventories")
            ]);

            // Helper: Lấy dữ liệu an toàn (Xử lý cả Array và Page.content)
            const extractData = (result: PromiseSettledResult<any>, name: string) => {
                if (result.status === 'fulfilled') {
                    const data = result.value.data;
                    // API /users/all trả về List -> Array.isArray là true
                    // API khác trả về Page -> lấy .content
                    return Array.isArray(data) ? data : (data.content || []);
                } else {
                    console.error(`Lỗi tải ${name}:`, result.reason);
                    return [];
                }
            };

            const users: User[] = extractData(results[0], "Users");
            const tickets: ServiceTicket[] = extractData(results[1], "Tickets");
            const appointments: Appointment[] = extractData(results[2], "Appointments");
            const parts: Part[] = extractData(results[3], "Parts");
            const inventories: Inventory[] = extractData(results[4], "Inventories");

            const lowStockValue = inventories.filter((inv) => {
                // Lấy ngưỡng tối thiểu, nếu null thì mặc định là 10
                const threshold = inv.minQuantity || 10;
                return inv.quantity <= threshold;
            }).length;

            // --- TÍNH TOÁN LOGIC ---

            // 1. Doanh thu (Tickets)
            let revToday = 0;
            let revWeek = 0;
            let revMonth = 0;
            let revTotal = 0;
            const revenueByMonth = new Array(12).fill(0);

            tickets.forEach((t) => {
                if (t.status === "COMPLETED") {

                    // B1: Ưu tiên lấy totalCost từ Backend (ép kiểu Number cho an toàn)
                    let cost = Number(t.totalCost) || 0;

                    // B2: Nếu totalCost = 0 hoặc lỗi, tự tính tổng từ items và parts
                    if (cost === 0) {
                        // Ép kiểu Number(i.lineTotal) để tránh lỗi nếu backend trả về string "100000"
                        const itemsTotal = t.items?.reduce((sum, i) => sum + (Number(i.lineTotal) || 0), 0) || 0;
                        const partsTotal = t.parts?.reduce((sum, p) => sum + (Number(p.lineTotal) || 0), 0) || 0;
                        cost = itemsTotal + partsTotal;
                    }

                    // B3: Chặn đứng NaN (Nếu tính xong vẫn ra NaN thì gán về 0 để không làm hỏng tổng chung)
                    if (isNaN(cost)) {
                        console.warn(`Ticket #${t.ticketId} bị lỗi dữ liệu tiền:`, t);
                        cost = 0;
                    }

                    // --- [KẾT THÚC SỬA LỖI] ---

                    const ticketDate = new Date(t.endTime || t.startTime);

                    // Cộng dồn (Bây giờ cost chắc chắn là số)
                    revTotal += cost;

                    if (isToday(ticketDate)) revToday += cost;
                    if (isThisWeek(ticketDate)) revWeek += cost;
                    if (isThisMonth(ticketDate)) revMonth += cost;

                    // Dữ liệu biểu đồ (Năm hiện tại)
                    if (ticketDate.getFullYear() === new Date().getFullYear()) {
                        revenueByMonth[ticketDate.getMonth()] += cost;
                    }
                }
            });

            // 2. Lịch hẹn mới nhất
            const recentAppts = [...appointments]
                .sort((a, b) => new Date(b.createdAt || b.appointmentDate).getTime() - new Date(a.createdAt || a.appointmentDate).getTime())
                .slice(0, 5);

            // 3. Cập nhật State
            setStats({
                revenueToday: revToday,
                revenueWeek: revWeek,
                revenueMonth: revMonth,
                totalRevenue: revTotal,

                pendingAppointments: appointments.filter(a => a.status === "PENDING").length,
                lowStockCount: lowStockValue,

                // Đếm user theo Role (Dữ liệu từ /api/users/all)
                totalCustomers: users.filter(u => u.role === "CUSTOMER").length,
                totalStaff: users.filter(u => u.role === "STAFF").length,
                totalTechnicians: users.filter(u => u.role === "TECHNICIAN").length,
            });

            setRecentAppointments(recentAppts);

            // Dữ liệu biểu đồ 6 tháng gần nhất
            const currentMonth = new Date().getMonth();
            const chartData = revenueByMonth.map((total, index) => ({
                name: `Tháng ${index + 1}`,
                total: total
            })).slice(Math.max(0, currentMonth - 5), currentMonth + 1);

            setRevenueData(chartData);

        } catch (error) {
            console.error("Dashboard Error:", error);
            toast({ title: "Lỗi", description: "Không thể tải dữ liệu Dashboard", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Tổng quan</h2>
                <p className="text-muted-foreground">Trung tâm chỉ huy và giám sát hoạt động hệ thống.</p>
            </div>

            {/* Hàng 1: Doanh thu */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Hôm nay</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.revenueToday)}</div>
                        <p className="text-xs text-muted-foreground">Doanh thu trong ngày</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tuần này</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.revenueWeek)}</div>
                        <p className="text-xs text-muted-foreground">Từ thứ 2 đến nay</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tháng này</CardTitle>
                        <Calendar className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.revenueMonth)}</div>
                        <p className="text-xs text-muted-foreground">Tổng doanh thu tháng</p>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-primary">Tổng cộng</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{formatCurrency(stats.totalRevenue)}</div>
                        <p className="text-xs text-primary/80">Toàn thời gian</p>
                    </CardContent>
                </Card>
            </div>

            {/* Hàng 2: Chỉ số Nhân sự & Kho */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-red-500 shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Cảnh báo Kho</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2"><Package className="h-5 w-5 text-red-500" /><span className="text-2xl font-bold text-red-600">{stats.lowStockCount}</span></div>
                        <p className="text-xs text-muted-foreground">Mặt hàng sắp hết</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Nhân viên (Staff)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-blue-500" /><span className="text-2xl font-bold">{stats.totalStaff}</span></div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500 shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Kỹ thuật viên</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2"><Wrench className="h-5 w-5 text-orange-500" /><span className="text-2xl font-bold">{stats.totalTechnicians}</span></div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500 shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Khách hàng</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2"><Users className="h-5 w-5 text-green-500" /><span className="text-2xl font-bold">{stats.totalCustomers}</span></div>
                    </CardContent>
                </Card>
            </div>

            {/* Hàng 3: Biểu đồ & List */}
            <div className="grid gap-4 md:grid-cols-7">
                <Card className="md:col-span-4">
                    <CardHeader>
                        <CardTitle>Biểu đồ Doanh thu</CardTitle>
                        <CardDescription>Tổng quan 6 tháng gần nhất</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000000}M`} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'transparent'}} />
                                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            Lịch hẹn mới nhất
                            <Badge variant="secondary">{stats.pendingAppointments} Chờ xử lý</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Khách hàng</TableHead>
                                    <TableHead className="text-right">Trạng thái</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentAppointments.length === 0 ? (
                                    <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">Không có dữ liệu</TableCell></TableRow>
                                ) : (
                                    recentAppointments.map((appt) => (
                                        <TableRow key={appt.appointmentId}>
                                            <TableCell>
                                                <div className="font-medium">{appt.customerName}</div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {appt.appointmentTime} - {new Date(appt.appointmentDate).toLocaleDateString('vi-VN')}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={appt.status === 'PENDING' ? 'destructive' : 'outline'}>{appt.status}</Badge>
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