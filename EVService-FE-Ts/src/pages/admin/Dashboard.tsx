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
import { toast } from "sonner";
import { format, isToday, isThisWeek } from "date-fns";
import vi from 'date-fns/locale/vi';

// XÓA: Import sử dụng alias do lỗi biên dịch
// import api from "@/services/api";
// import { profitService, ProfitReport } from "@/services/profitService";


// --- INTERFACE VÀ KIỂU DỮ LIỆU ---

interface User {
    userId: number;
    role: 'CUSTOMER' | 'STAFF' | 'TECHNICIAN' | 'ADMIN';
}

interface Appointment {
    appointmentId: number;
    status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
    createdAt?: string;
    appointmentDate: string;
    appointmentTime: string;
    customerName: string;
    serviceType: string;
}

interface ServiceTicket {
    ticketId: number;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
    endTime?: string;
    startTime: string;
    items?: { lineTotal?: number }[];
    parts?: { lineTotal?: number }[];
}

interface Inventory {
    inventoryId: number;
    quantity: number; // quantityInStock (Tồn kho)
    minQuantity: number; // Ngưỡng tối thiểu
    partId: number;
    partName: string;
}

interface ProfitReport {
    year: number;
    month: number;
    totalRevenue: number;
    staffSalary: number;
    technicianSalary: number;
    partCost: number;
    totalExpense: number;
    profit: number; // Lợi nhuận Ròng
}

interface DashboardStats {
    profitToday: number; // Lợi nhuận gộp (proxy)
    profitWeek: number;  // Lợi nhuận gộp (proxy)
    profitMonth: number; // Lợi nhuận ròng (từ API mock)
    totalProfit: number; // Lợi nhuận gộp (proxy)

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


// --- RE-INTEGRATED MOCK DATA và SERVICE STUBS (Fix lỗi biên dịch) ---

const mockUserData = (role: string) => Array.from({ length: role === 'CUSTOMER' ? 120 : (role === 'TECHNICIAN' ? 15 : 8) }, (_, i) => ({ userId: i, role: role as User['role'] }));
const mockInventoryData: Inventory[] = Array.from({ length: 50 }, (_, i) => ({
    inventoryId: i,
    quantity: i < 5 ? 5 : 50, // 5 item dưới ngưỡng
    minQuantity: 10,
    partId: i,
    partName: `Part ${i}`
}));

const getMockTickets = () => {
    const now = Date.now();
    const tickets = [];
    for (let i = 0; i < 100; i++) {
        const startTime = now - Math.random() * 6 * 30 * 24 * 60 * 60 * 1000;
        tickets.push({
            ticketId: i,
            status: i % 10 < 2 ? 'PENDING' : 'COMPLETED',
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(now - Math.random() * 1000).toISOString(),
            // Giả định doanh thu từ 700k - 1tr3 VND
            items: [{ lineTotal: 500000 + Math.random() * 500000 }],
            parts: [{ lineTotal: 200000 + Math.random() * 300000 }],
        });
    }
    return tickets as ServiceTicket[];
};
const mockTickets = getMockTickets();

const mockAppointments: Appointment[] = Array.from({ length: 10 }, (_, i) => ({
    appointmentId: i,
    status: i % 2 === 0 ? 'PENDING' : 'COMPLETED',
    createdAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
    appointmentDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    appointmentTime: '10:00',
    customerName: `Customer ${i}`,
    serviceType: `Service ${i % 3}`,
}));


const api = {
    get: async (url: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));

        if (url.includes("/api/users/role/")) {
            const role = url.split('/').pop();
            return { data: mockUserData(role!) };
        }
        if (url.includes("/api/service-tickets")) {
            return { data: mockTickets };
        }
        if (url.includes("/api/appointments")) {
            return { data: mockAppointments };
        }
        if (url.includes("/api/inventory")) {
            return { data: mockInventoryData };
        }
        return { data: [] };
    }
};

const profitService = {
    getProfitReport: async (year: number, month: number): Promise<ProfitReport> => {
        await new Promise(resolve => setTimeout(resolve, 300));

        // Mock a positive profit for the current month
        return {
            year,
            month,
            totalRevenue: 250000000,
            staffSalary: 50000000,
            technicianSalary: 30000000,
            partCost: 20000000,
            totalExpense: 100000000,
            profit: 150000000,
        };
    }
};
// --- END RE-INTEGRATED MOCK SERVICES ---


// Tỷ suất lợi nhuận gộp giả định cho tính toán Day/Week/Total
const GROSS_MARGIN_RATE = 0.5; // 50% lợi nhuận gộp

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        profitToday: 0, profitWeek: 0, profitMonth: 0, totalProfit: 0,
        pendingAppointments: 0, lowStockCount: 0,
        totalCustomers: 0, totalStaff: 0, totalTechnicians: 0,
    } as const);

    const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
    const [profitData, setProfitData] = useState<ChartDataItem[]>([]);

    // Helper format tiền tệ
    const formatCurrency = (value: number | undefined | null) => {
        const safeValue = Number(value) || 0;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(safeValue);
    };


    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1; // 1-based month
            const currentMonthIndex = now.getMonth();


            // 1. Fetch dữ liệu cơ bản và Lợi nhuận ròng tháng hiện tại
            const [
                customersRes,
                staffRes,
                techniciansRes,
                ticketsRes,
                appointmentsRes,
                inventoryRes,
                monthlyProfitRes
            ] = await Promise.all([
                api.get<User[]>("/api/users/role/CUSTOMER"),
                api.get<User[]>("/api/users/role/STAFF"),
                api.get<User[]>("/api/users/role/TECHNICIAN"),
                api.get<ServiceTicket[]>("/api/service-tickets"),
                api.get<Appointment[]>("/api/appointments"),
                api.get<Inventory[]>("/api/inventory"),
                profitService.getProfitReport(currentYear, currentMonth),
            ]);

            const customers = customersRes.data;
            const staff = staffRes.data;
            const technicians = techniciansRes.data;

            const tickets = ticketsRes.data;
            const appointments = appointmentsRes.data;
            const inventory = inventoryRes.data;
            const currentMonthlyNetProfit: ProfitReport = monthlyProfitRes;

            let grossProfitToday = 0;
            let grossProfitWeek = 0;
            let grossProfitTotal = 0;


            const grossProfitByMonth = new Array(12).fill(0);

            // 2. Tính toán Lợi nhuận Gộp (Gross Profit) cho Day/Week/Total/Chart
            tickets.forEach((t) => {
                if (t.status === "COMPLETED") {
                    const itemsTotal = t.items?.reduce((sum, i) => sum + (i.lineTotal || 0), 0) || 0;
                    const partsTotal = t.parts?.reduce((sum, p) => sum + (p.lineTotal || 0), 0) || 0;
                    const totalRevenue = itemsTotal + partsTotal;

                    // *** LOGIC TÍNH LỢI NHUẬN GỘP (PROXY) ***
                    const grossProfit = totalRevenue * GROSS_MARGIN_RATE;

                    const rawDate = t.endTime || t.startTime;
                    const ticketDate = new Date(rawDate);

                    if (isNaN(ticketDate.getTime())) return;

                    grossProfitTotal += grossProfit;

                    if (isToday(ticketDate)) grossProfitToday += grossProfit;
                    if (isThisWeek(ticketDate)) grossProfitWeek += grossProfit;

                    if (ticketDate.getFullYear() === currentYear) {
                        grossProfitByMonth[ticketDate.getMonth()] += grossProfit;
                    }
                }
            });

            // 3. Xử lý tồn kho thấp (minQuantity)
            const lowStock = inventory.filter((p) => p.quantity <= p.minQuantity).length;

            // 4. Xử lý Lợi nhuận cho Biểu đồ (Sử dụng Gross Profit tính ở bước 2)
            // Lấy 6 tháng gần nhất có data
            const lastSixMonthsData: ChartDataItem[] = [];
            for(let i = 5; i >= 0; i--) {
                // Tính toán tháng lùi
                const monthDate = new Date(currentYear, currentMonthIndex - i, 1);
                const monthIndex = monthDate.getMonth();
                const monthName = format(monthDate, 'MMMM', { locale: vi });

                lastSixMonthsData.push({
                    name: monthName,
                    total: grossProfitByMonth[monthIndex],
                });
            }

            // 5. Cập nhật State
            setStats({
                profitToday: grossProfitToday,
                profitWeek: grossProfitWeek,
                profitMonth: currentMonthlyNetProfit.profit, // Lợi nhuận Ròng từ API
                totalProfit: grossProfitTotal,

                pendingAppointments: appointments.filter(a => a.status === "PENDING").length,
                lowStockCount: lowStock,

                totalCustomers: customers.length,
                totalStaff: staff.length,
                totalTechnicians: technicians.length,
            });


            setProfitData(lastSixMonthsData);

            const recentAppts = [...appointments]
                .sort((a, b) => new Date(b.createdAt || a.appointmentDate).getTime() - new Date(a.createdAt || a.appointmentDate).getTime())
                .slice(0, 5);
            setRecentAppointments(recentAppts);


        } catch (error) {
            console.error("Dashboard fetch error:", error);
            toast.error("Lỗi tải dữ liệu Dashboard. Vui lòng kiểm tra API và kết nối.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    if (loading) {
        return <div className="flex h-96 items-center justify-center text-lg font-medium text-primary">Đang tải dữ liệu Dashboard...</div>;
    }

    return (
        <div className="space-y-8 p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="pb-4 border-b">
                <h2 className="text-4xl font-extrabold tracking-tight text-gray-800">📊 Bảng điều khiển Quản trị</h2>
                <p className="text-muted-foreground mt-1">
                    Trung tâm chỉ huy lợi nhuận, vận hành và quản lý tài nguyên.
                </p>
            </div>

            {/* --- PHẦN 1: HIỆU SUẤT LỢI NHUẬN (PROFIT) --- */}
            <div>
                <h3 className="text-xl font-bold mb-4 text-gray-700">Hiệu suất Lợi nhuận</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700">Lợi nhuận Gộp Hôm nay</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-800">{formatCurrency(stats.profitToday)}</div>
                            <p className="text-xs text-muted-foreground">Lợi nhuận gộp ước tính</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-700">Lợi nhuận Gộp Tuần này</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-800">{formatCurrency(stats.profitWeek)}</div>
                            <p className="text-xs text-muted-foreground">Lợi nhuận gộp ước tính</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-purple-700">Lợi nhuận RÒNG Tháng này</CardTitle>
                            <Calendar className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            {/* Dữ liệu Lợi nhuận RÒNG từ API */}
                            <div className="text-2xl font-bold text-purple-800">{formatCurrency(stats.profitMonth)}</div>
                            <p className="text-xs text-muted-foreground">Đã trừ chi phí vận hành và lương</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/40 shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-primary">Tổng Lợi nhuận Gộp</CardTitle>
                            <Activity className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">{formatCurrency(stats.totalProfit)}</div>
                            <p className="text-xs text-primary/80">Toàn thời gian (Gross Margin Proxy)</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* --- PHẦN 2: CHỈ SỐ VẬN HÀNH & NHÂN SỰ --- */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Cảnh báo kho */}
                <Card className="border-l-4 border-l-red-500 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Cảnh báo Tồn kho</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-red-500" />
                            <span className="text-2xl font-bold text-red-600">{stats.lowStockCount}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Mặt hàng dưới ngưỡng tối thiểu (minQuantity)</p>
                    </CardContent>
                </Card>

                {/* Thống kê Staff */}
                <Card className="border-l-4 border-l-blue-500 shadow-md">
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
                <Card className="border-l-4 border-l-orange-500 shadow-md">
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
                <Card className="border-l-4 border-l-green-500 shadow-md">
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
                <Card className="col-span-4 shadow-lg">
                    <CardHeader>
                        <CardTitle>Biểu đồ Tăng trưởng Lợi nhuận Gộp</CardTitle>
                        <CardDescription>Lợi nhuận gộp (Gross Margin) 6 tháng gần nhất</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={profitData}>
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
                                    tickFormatter={(value) => `${Math.round(value / 1000000)}M`}
                                />
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value)}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Danh sách lịch hẹn mới nhất (View Only) */}
                <Card className="col-span-3 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            Lịch hẹn mới nhất
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                {stats.pendingAppointments} Chờ xử lý
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            Danh sách 5 lịch hẹn vừa được đặt gần đây.
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
                                                        {format(new Date(appt.appointmentDate), "dd/MM", { locale: vi })} - {appt.appointmentTime}
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