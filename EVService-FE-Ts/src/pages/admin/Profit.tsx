import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DollarSign, BarChart, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as dateFns from 'date-fns'; // Dùng dateFns cho các hàm phụ trợ

// KHẮC PHỤC: Sử dụng alias chuẩn (Giả định cấu hình alias đã đúng)
import { profitService, ProfitReport } from "@/services/profitService";
import { format } from 'date-fns'; // Import format rõ ràng

// Hàm định dạng tiền tệ Việt Nam Đồng (VND)
const formatCurrencyVND = (amount: number | undefined): string => {
    const safeAmount = Math.max(0, Number(amount) || 0);
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(safeAmount);
};

export default function Details() {
    const { toast } = useToast();
    const now = new Date();

    // Khởi tạo trạng thái tháng và năm hiện tại
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-based month

    const [report, setReport] = useState<ProfitReport | null>(null);
    const [loading, setLoading] = useState(false);

    // Chuỗi YYYY-MM cho input month
    const monthInputString = useMemo(() => {
        const y = String(selectedYear);
        const m = String(selectedMonth).padStart(2, '0');
        return `${y}-${m}`;
    }, [selectedYear, selectedMonth]);

    // --- Lấy dữ liệu báo cáo ---
    const fetchProfitReport = useCallback(async (year: number, month: number) => {
        setLoading(true);
        setReport(null);
        try {
            const data = await profitService.getProfitReport(year, month);
            setReport(data);
        } catch (error) {
            console.error("Failed to fetch profit report:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải báo cáo lợi nhuận.",
                variant: "destructive",
            });
            setReport(null);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        // Tự động fetch khi component load
        fetchProfitReport(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth, fetchProfitReport]);

    // --- Xử lý thay đổi tháng/năm ---
    const handleMonthYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [yStr, mStr] = e.target.value.split('-');
        if (yStr && mStr) {
            setSelectedYear(Number(yStr));
            setSelectedMonth(Number(mStr));
        }
    };

    // Giá trị tính toán nhanh
    const profitStatus = report && report.profit > 0 ? 'profit' : report && report.profit < 0 ? 'loss' : 'neutral';

    // Đã sửa lỗi: Dùng biến Component name (đổi tên biến để tránh nhầm lẫn)
    const ProfitIconComponent = profitStatus === 'profit' ? TrendingUp : profitStatus === 'loss' ? TrendingDown : BarChart;


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">💰 Báo cáo Chi tiết Doanh thu & Lợi nhuận</h2>
                    <p className="text-muted-foreground">
                        Theo dõi chi tiết Doanh thu, Chi phí và Lợi nhuận hàng tháng.
                    </p>
                </div>
            </div>

            {/* --- Bộ lọc thời gian --- */}
            <Card className="p-4 shadow-lg w-full md:w-1/2">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="profit-month">Chọn tháng báo cáo</Label>
                    <Input
                        id="profit-month"
                        type="month"
                        value={monthInputString}
                        onChange={handleMonthYearChange}
                        // Giới hạn không cho chọn tháng trong tương lai quá xa
                        max={format(new Date(), 'yyyy-MM')}
                    />
                </div>
            </Card>

            {loading ? (
                <Card className="p-10 text-center shadow-lg">
                    <p>Đang tải báo cáo cho {selectedMonth}/{selectedYear}...</p>
                </Card>
            ) : report ? (
                <>
                    {/* --- Thống kê Tổng quan --- */}
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Tổng Doanh thu */}
                        <Card className="shadow-lg bg-green-50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-green-700">TỔNG DOANH THU</CardTitle>
                                <DollarSign className="h-4 w-4 text-green-700" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-800">{formatCurrencyVND(report.totalRevenue)}</div>
                                <p className="text-xs text-muted-foreground">Doanh thu từ tất cả hóa đơn đã thanh toán.</p>
                            </CardContent>
                        </Card>

                        {/* Tổng Chi phí */}
                        <Card className="shadow-lg bg-red-50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-red-700">TỔNG CHI PHÍ</CardTitle>
                                <DollarSign className="h-4 w-4 text-red-700" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-red-800">{formatCurrencyVND(report.totalExpense)}</div>
                                <p className="text-xs text-muted-foreground">Chi phí lương và vật tư.</p>
                            </CardContent>
                        </Card>

                        {/* Lợi nhuận ròng */}
                        <Card className={`shadow-lg ${profitStatus === 'profit' ? 'bg-blue-50' : profitStatus === 'loss' ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">LỢI NHUẬN RÒNG</CardTitle>
                                {/* Đã sửa lỗi: Render component bằng cách gọi biến component */}
                                <ProfitIconComponent className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-primary">{formatCurrencyVND(report.profit)}</div>
                                <p className="text-xs text-muted-foreground">Lợi nhuận sau khi trừ chi phí.</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* --- Chi tiết Chi phí --- */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Chi tiết Chi phí ({selectedMonth}/{selectedYear})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium">1. Chi phí Lương Nhân viên (Staff)</span>
                                <span>{formatCurrencyVND(report.staffSalary)}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium">2. Chi phí Lương Kỹ thuật viên (Technician)</span>
                                <span>{formatCurrencyVND(report.technicianSalary)}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium">3. Chi phí Vật tư (Part Cost)</span>
                                <span>{formatCurrencyVND(report.partCost)}</span>
                            </div>
                            <div className="flex justify-between pt-3 font-bold text-lg border-t mt-4">
                                <span>TỔNG CHI PHÍ</span>
                                <span>{formatCurrencyVND(report.totalExpense)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <Card className="p-10 text-center shadow-lg">
                    <p className="text-muted-foreground">Vui lòng chọn tháng để xem báo cáo lợi nhuận.</p>
                </Card>
            )}
        </div>
    );
}