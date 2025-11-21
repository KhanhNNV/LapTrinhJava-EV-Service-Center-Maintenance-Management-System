import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Users, Clock, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label"; // Import Label
import { Input } from "@/components/ui/input"; // Import Input

// KHẮC PHỤC: Sử dụng alias chuẩn (Giả định cấu hình alias đã đúng)
import { performanceService, PerformanceService } from "@/services/performanceService";
import * as dateFns from 'date-fns';
import { DateRange } from "react-day-picker";

// Helper function to calculate date range for quick filters
const getRange = (type: 'day' | 'week' | 'month' | 'custom', dateStr?: string): DateRange => {
    const today = new Date();
    let start: Date;
    let end: Date;

    // Bộ lọc nhanh (Ngày, Tuần, Tháng) LUÔN DỰA TRÊN NGÀY HIỆN TẠI
    if (type === 'day') {
        start = today;
        end = today;
    } else if (type === 'week') {
        start = dateFns.startOfWeek(today, { weekStartsOn: 1 }); // Tuần bắt đầu từ Thứ Hai
        end = dateFns.endOfWeek(today, { weekStartsOn: 1 });
    } else if (type === 'month') {
        start = dateFns.startOfMonth(today);
        end = dateFns.endOfMonth(today);
    } else if (type === 'custom' && dateStr) {
        // Parse YYYY-MM string to Date object
        const dateFromStr = dateFns.parse(dateStr, 'yyyy-MM', new Date());
        start = dateFns.startOfMonth(dateFromStr);
        end = dateFns.endOfMonth(dateFromStr);
    } else {
        // Default (Trường hợp không xác định hoặc custom không có dateStr)
        start = dateFns.subDays(today, 7);
        end = today;
    }

    return { from: start, to: end };
};

export default function Performance() {
    const { toast } = useToast();
    // Đổi PerformanceService thành TechnicianPerformance để khớp với service
    const [performanceData, setPerformanceData] = useState<PerformanceService[]>([]);
    const [loading, setLoading] = useState(false);

    // Khởi tạo tháng hiện tại dưới dạng YYYY-MM
    const defaultMonthString = dateFns.format(new Date(), 'yyyy-MM');
    const [selectedMonthString, setSelectedMonthString] = useState<string>(defaultMonthString);

    // Khởi tạo ban đầu là tháng hiện tại
    const [dateRange, setDateRange] = useState<DateRange>(getRange('custom', defaultMonthString));
    const [filterType, setFilterType] = useState<'day' | 'week' | 'month' | 'custom'>('custom');

    // --- Lấy dữ liệu báo cáo ---
    const fetchPerformance = useCallback(async (start: Date, end: Date) => {
        setLoading(true);
        try {
            // Sử dụng TechnicianPerformance interface (giả định)
            const data = await performanceService.getPerformanceReport(start, end);
            setPerformanceData(data);
        } catch (error) {
            console.error("Failed to fetch performance report:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải báo cáo hiệu suất kỹ thuật viên.",
                variant: "destructive",
            });
            setPerformanceData([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Effect để fetch data khi dateRange thay đổi
    useEffect(() => {
        if (dateRange.from && dateRange.to) {
            fetchPerformance(dateRange.from, dateRange.to);
        }
    }, [dateRange, fetchPerformance]);

    // --- Xử lý thay đổi bộ lọc nhanh (Dựa trên ngày hiện tại) ---
    const handleQuickFilter = (type: 'day' | 'week' | 'month') => {
        setFilterType(type);

        // Tính toán range dựa trên ngày hiện tại
        const newRange = getRange(type);

        // Cập nhật selectedMonthString nếu chọn 'Tháng' để input month phản ánh
        if (type === 'month') {
            setSelectedMonthString(dateFns.format(new Date(), 'yyyy-MM'));
        } else {
            // Đặt lại custom filter (input month) về rỗng khi chọn Ngày/Tuần
            setSelectedMonthString('');
        }

        setDateRange(newRange);
    };

    // --- Xử lý thay đổi input tháng (Luôn là filter 'custom') ---
    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMonthStr = e.target.value; // YYYY-MM
        setSelectedMonthString(newMonthStr);
        setFilterType('custom');

        // Tính toán range cho tháng mới
        const newRange = getRange('custom', newMonthStr);
        setDateRange(newRange);
    };

    // --- Tổng hợp số liệu thống kê ---
    const totals = useMemo(() => {
        return performanceData.reduce((acc, current) => {
            acc.totalTickets += current.totalTickets;
            acc.totalHours += current.totalHours;
            return acc;
        }, {
            totalTickets: 0,
            totalHours: 0,
        });
    }, [performanceData]);

    const formattedDateRange = useMemo(() => {
        if (!dateRange.from) return "Chọn ngày";

        // Kiểm tra xem có đang ở chế độ chọn tháng cụ thể không
        if (filterType === 'custom' && dateRange.from) {
            const monthName = dateFns.format(dateRange.from, 'MM/yyyy');
            return `Tháng: ${monthName}`;
        }

        // Hiển thị ngày/tuần/tổng quan
        const startStr = dateFns.format(dateRange.from, 'dd/MM/yyyy');
        if (!dateRange.to || dateFns.isSameDay(dateRange.from, dateRange.to)) {
            // Hiển thị ngày cụ thể khi chọn Quick Filter 'Ngày' (của tháng đã chọn)
            return `Ngày: ${startStr}`;
        }
        const endStr = dateFns.format(dateRange.to, 'dd/MM/yyyy');
        return `Từ: ${startStr} đến: ${endStr}`;
    }, [dateRange, filterType]);


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">⚡ Báo cáo Hiệu suất Kỹ thuật viên</h2>
                    <p className="text-muted-foreground">
                        Theo dõi năng suất làm việc của các kỹ thuật viên.
                    </p>
                </div>
            </div>

            {/* --- Bộ lọc thời gian --- */}
            <Card className="p-4 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center gap-4">

                    {/* Input chọn tháng cụ thể (FILTER CHÍNH) */}
                    <div className="flex flex-col gap-2 w-48">
                        <Label htmlFor="performance-month">Chọn tháng</Label>
                        <Input
                            id="performance-month"
                            type="month"
                            // Hiển thị tháng đang được sử dụng làm cơ sở
                            value={selectedMonthString || ''}
                            onChange={handleMonthChange}
                        />
                    </div>

                    <div className="md:border-l md:pl-4 md:py-2">
                        <span className="text-sm font-medium block mb-2">Bộ lọc nhanh (Dựa trên ngày hiện tại):</span>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                // Khi dùng quick filter, ta chuyển trạng thái về loại đó
                                variant={filterType === 'day' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleQuickFilter('day')}
                            >
                                Hôm nay
                            </Button>
                            <Button
                                variant={filterType === 'week' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleQuickFilter('week')}
                            >
                                Tuần này
                            </Button>
                            <Button
                                variant={filterType === 'month' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleQuickFilter('month')}
                            >
                                Tháng này
                            </Button>
                        </div>
                    </div>
                </div>
                <p className="mt-4 text-sm font-semibold flex items-center gap-2 border-t pt-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    Khoảng thời gian đang xem: {formattedDateRange}
                </p>
            </Card>


            {/* --- Thống kê Tổng quan --- */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Tổng Kỹ thuật viên
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{performanceData.length}</div>
                        <p className="text-xs text-muted-foreground">đã được thống kê</p>
                    </CardContent>
                </Card>
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Tổng Ticket Hoàn thành
                        </CardTitle>
                        <Zap className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{totals.totalTickets}</div>
                        <p className="text-xs text-muted-foreground">trong khoảng thời gian này</p>
                    </CardContent>
                </Card>
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Tổng Giờ làm việc
                        </CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totals.totalHours.toFixed(1)} h</div>
                        <p className="text-xs text-muted-foreground">tổng số giờ dịch vụ được ghi nhận</p>
                    </CardContent>
                </Card>
            </div>

            {/* --- Bảng chi tiết hiệu suất --- */}
            <Card>
                <CardHeader>
                    <CardTitle>Bảng Chi tiết Hiệu suất</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-10">Đang tải dữ liệu hiệu suất...</div>
                    ) : performanceData.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            Không có kỹ thuật viên hoặc dữ liệu hiệu suất nào được tìm thấy trong khoảng thời gian này.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Tên Kỹ thuật viên</TableHead>
                                    <TableHead className="text-right">Số Ticket Hoàn thành</TableHead>
                                    <TableHead className="text-right">Tổng Giờ làm việc (h)</TableHead>
                                    <TableHead className="text-right">Ticket/Giờ (Hiệu suất)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {performanceData.map((item) => {
                                    const performanceRate = item.totalHours > 0 ? (item.totalTickets / item.totalHours) : 0;
                                    return (
                                        <TableRow key={item.technicianId}>
                                            <TableCell>{item.technicianId}</TableCell>
                                            <TableCell className="font-medium">{item.fullName}</TableCell>
                                            <TableCell className="text-right font-bold">{item.totalTickets}</TableCell>
                                            <TableCell className="text-right">{item.totalHours.toFixed(1)}</TableCell>
                                            <TableCell className="text-right text-sm text-primary">
                                                {performanceRate.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}