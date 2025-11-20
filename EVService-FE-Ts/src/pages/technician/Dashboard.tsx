import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Wrench, CheckCircle, CalendarDays, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth";
import { technicianDashboardService, DashboardStats } from "@/services/technicianDashboardService";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function TechnicianDashboard() {
    const { toast } = useToast();
    const currentUser = authService.getCurrentUser();

    const [stats, setStats] = useState<DashboardStats>({
        assignedAppointments: 0,
        inProgressTickets: 0,
        completedToday: 0,
        completedInMonth: 0,
    });

    const [selectedMonth, setSelectedMonth] = useState<string>(
        new Date().toISOString().slice(0, 7)
    );

    // Thay vì dùng 1 biến isLoading chung, ta dùng isFirstLoad để chỉ hiện loader to lần đầu
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    // Biến này dùng để hiện loading nhỏ khi đổi tháng
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (currentUser?.id) {
            fetchDashboardData();
        }
    }, [currentUser?.id, selectedMonth]);

    const fetchDashboardData = async () => {
        // Nếu là lần đầu load trang -> Hiện loader to
        // Nếu đã có dữ liệu rồi (đổi tháng) -> Hiện loader nhỏ (isUpdating)
        if (isFirstLoad) {
            // Giữ nguyên logic
        } else {
            setIsUpdating(true);
        }

        try {
            const dateObj = new Date(selectedMonth + "-01");
            const data = await technicianDashboardService.getStats(currentUser!.id, dateObj);
            setStats(data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch stats", variant: "destructive" });
        } finally {
            setIsFirstLoad(false); // Tắt loader to
            setIsUpdating(false);  // Tắt loader nhỏ
        }
    };

    const statCards = [
        {
            title: "Lịch được phân công",
            value: stats.assignedAppointments,
            icon: Calendar,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            isFilter: false
        },
        {
            title: "Đang thực hiện",
            value: stats.inProgressTickets,
            icon: Wrench,
            color: "text-orange-500",
            bg: "bg-orange-50 dark:bg-orange-900/20",
            isFilter: false
        },
        {
            title: "Hoàn thành hôm nay",
            value: stats.completedToday,
            icon: CheckCircle,
            color: "text-green-500",
            bg: "bg-green-50 dark:bg-green-900/20",
            isFilter: false
        },
        {
            title: "Hoàn thành trong tháng",
            value: stats.completedInMonth,
            icon: CalendarDays,
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-900/20",
            isFilter: true
        },
    ];

    // --- 1. XỬ LÝ LOADING LẦN ĐẦU TIÊN (Vẫn hiện màn hình chờ) ---
    if (isFirstLoad) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h2>
                    <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                </div>
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    // --- 2. GIAO DIỆN CHÍNH (Luôn hiển thị, không bị ẩn đi khi update) ---
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Tổng quan</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, index) => {
                    const IconElement = (
                        <div className={`p-2 rounded-full ${stat.bg} transition-all ${stat.isFilter ? "cursor-pointer hover:ring-2 ring-purple-200 hover:scale-105" : ""}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                    );

                    return (
                        <Card key={index} className="hover:shadow-md transition-all">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>

                                {stat.isFilter ? (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button title="Nhấn để chọn tháng">{IconElement}</button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-4" align="end">
                                            <div className="grid gap-2">
                                                <Label htmlFor="month-picker" className="font-semibold">Chọn tháng thống kê:</Label>
                                                <Input
                                                    id="month-picker"
                                                    type="month"
                                                    value={selectedMonth}
                                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                                    className="cursor-pointer"
                                                />
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                ) : (
                                    IconElement
                                )}
                            </CardHeader>
                            <CardContent>
                                {/* --- 3. HIỆU ỨNG LOADING CỤC BỘ --- */}
                                {/* Nếu đang update (đổi tháng) VÀ đây là thẻ có chức năng lọc -> Hiện spinner thay vì số */}
                                {isUpdating && stat.isFilter ? (
                                    <div className="h-8 flex items-center">
                                        <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                                    </div>
                                ) : (
                                    <div className="text-2xl font-bold animate-in fade-in duration-300">
                                        {stat.value}
                                    </div>
                                )}

                                {stat.isFilter && (
                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                        Dữ liệu: {selectedMonth.split("-")[1]}/{selectedMonth.split("-")[0]}
                                        <span className="text-[10px] text-purple-600 bg-purple-100 px-1 rounded">(Bấm icon để đổi)</span>
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}