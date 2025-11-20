import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { DollarSign, Edit, Users, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Đã sửa đường dẫn tuyệt đối sang tương đối
import { salaryService, SalaryItem, CommissionPayload } from "../../services/salaryService";
import {
    userService,
    UpdateBaseSalaryPayload,
    UpdateBaseSalaryByRolePayload
// Đã sửa đường dẫn tuyệt đối sang tương đối
} from "../../services/userService";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

// Interface mở rộng SalaryItem
interface EditableSalaryItem extends SalaryItem {
    newBaseSalary: number;
}

// Hàm định dạng tiền tệ Việt Nam Đồng (VND)
const formatCurrencyVND = (amount: number): string => {
    const safeAmount = Math.max(0, Number(amount) || 0);
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(safeAmount);
};

export default function EmployeesSalary() {
    const { toast } = useToast();
    const [salaries, setSalaries] = useState<SalaryItem[]>([]);
    const [loading, setLoading] = useState(false);

    const defaultMonth = new Date().toISOString().slice(0, 7);
    const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

    // State cho Dialog chỉnh sửa lương TỪNG NGƯỜI
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<EditableSalaryItem | null>(null);

    // State cho Dialog chỉnh sửa lương CHUNG
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
    const [bulkUpdate, setBulkUpdate] = useState<UpdateBaseSalaryByRolePayload>({
        role: 'STAFF',
        baseSalary: 0,
    });

    // State cho Dialog chỉnh sửa PHẦN TRĂM THƯỞNG
    const [isCommissionEditOpen, setIsCommissionEditOpen] = useState(false);
    const [commissionRate, setCommissionRate] = useState(0.3); // Mặc định 0.3 (30%)
    const [newCommissionRate, setNewCommissionRate] = useState(0.3); // Tỷ lệ đang chỉnh sửa

    // --- Lấy tỷ lệ hoa hồng hiện tại (Nếu có API) ---
    const fetchCommissionRate = useCallback(async () => {
        try {
            // Giả định: salaryService.getTechnicianCommission() trả về tỷ lệ (ví dụ: 0.3)
            const rate = await salaryService.getTechnicianCommission();
            setCommissionRate(rate);
            setNewCommissionRate(rate);
        } catch (error) {
            console.error("Failed to fetch commission rate:", error);
            // Có thể đặt giá trị mặc định nếu gọi API thất bại
            setCommissionRate(0.3);
            setNewCommissionRate(0.3);
        }
    }, []);

    // --- Lấy dữ liệu lương ---
    const fetchSalaries = useCallback(async (month: string) => {
        setLoading(true);
        try {
            const data = await salaryService.getEmployeesSalary(month);
            setSalaries(data);
        } catch (error) {
            console.error("Failed to fetch salaries:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải dữ liệu lương nhân viên.",
                variant: "destructive",
            });
            setSalaries([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchSalaries(selectedMonth);
        fetchCommissionRate();
    }, [selectedMonth, fetchSalaries, fetchCommissionRate]);


    // --- Chức năng chỉnh sửa % THƯỞNG ---
    const handleCommissionRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Lấy giá trị input (có thể là số thập phân hoặc phần trăm)
        const value = e.target.value.replace(/[^0-9.]/g, '');
        let rate = parseFloat(value);

        // Chuyển từ % sang thập phân nếu giá trị > 1 (người dùng nhập 30 thay vì 0.3)
        if (rate > 1 && rate <= 100) {
            rate = rate / 100;
        }

        setNewCommissionRate(isNaN(rate) ? 0 : rate);
    };

    const saveCommissionRate = async () => {
        if (isNaN(newCommissionRate) || newCommissionRate < 0 || newCommissionRate > 1) {
            toast({ title: "Lỗi", description: "Tỷ lệ thưởng phải nằm trong khoảng 0% đến 100%.", variant: "destructive" });
            return;
        }

        try {
            const payload: CommissionPayload = { commissionRate: newCommissionRate };
            await salaryService.updateTechnicianCommission(payload);

            toast({
                title: "Thành công",
                description: `Cập nhật tỷ lệ thưởng Kỹ thuật viên thành công (${(newCommissionRate * 100).toFixed(2)}%)!`,
            });

            setIsCommissionEditOpen(false);
            setCommissionRate(newCommissionRate);
            fetchSalaries(selectedMonth); // Tải lại dữ liệu lương để phản ánh tỷ lệ mới

        } catch (error) {
            toast({ title: "Lỗi", description: "Cập nhật tỷ lệ thưởng thất bại.", variant: "destructive" });
        }
    };


    // --- Chức năng chỉnh sửa lương TỪNG NGƯỜI (giữ nguyên) ---
    const openEditDialog = (user: SalaryItem) => {
        setEditingUser({
            ...user,
            newBaseSalary: user.baseSalary,
        });
        setIsEditOpen(true);
    };

    const handleBaseSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editingUser) {
            // Thay let bằng const
            const newSalary = Number(e.target.value.replace(/[^0-9]/g, ''));
            setEditingUser({
                ...editingUser,
                newBaseSalary: newSalary
            });
        }
    };

    const saveBaseSalary = async () => {
        if (!editingUser || isNaN(editingUser.newBaseSalary) || editingUser.newBaseSalary <= 0) {
            toast({ title: "Lỗi", description: "Lương cơ bản không hợp lệ.", variant: "destructive" });
            return;
        }

        try {
            const payload: UpdateBaseSalaryPayload = { baseSalary: editingUser.newBaseSalary };
            await userService.updateBaseSalary(editingUser.userId, payload);

            toast({
                title: "Thành công",
                description: `Cập nhật lương cơ bản cho ${editingUser.fullName} thành công!`,
            });

            setIsEditOpen(false);
            setEditingUser(null);
            fetchSalaries(selectedMonth);

        } catch (error) {
            toast({ title: "Lỗi", description: "Cập nhật lương cơ bản thất bại.", variant: "destructive" });
        }
    };

    // --- Chức năng chỉnh sửa lương CHUNG THEO ROLE (giữ nguyên) ---
    const handleBulkSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Thay let bằng const
        const newSalary = Number(e.target.value.replace(/[^0-9]/g, ''));
        setBulkUpdate(prev => ({ ...prev, baseSalary: newSalary }));
    };

    const handleRoleChange = (role: string) => {
        setBulkUpdate(prev => ({ ...prev, role: role as 'STAFF' | 'TECHNICIAN' }));
    }

    const saveBulkBaseSalary = async () => {
        if (isNaN(bulkUpdate.baseSalary) || bulkUpdate.baseSalary <= 0) {
            toast({ title: "Lỗi", description: "Lương cơ bản không hợp lệ.", variant: "destructive" });
            return;
        }

        try {
            await userService.updateBaseSalaryByRole(bulkUpdate);

            toast({
                title: "Thành công",
                description: `Cập nhật lương cơ bản chung cho nhóm ${bulkUpdate.role} thành công!`,
            });

            setIsBulkEditOpen(false);
            setBulkUpdate({ role: 'STAFF', baseSalary: 0 });
            fetchSalaries(selectedMonth);
        } catch (error) {
            toast({ title: "Lỗi", description: "Cập nhật lương chung thất bại. Vui lòng kiểm tra API.", variant: "destructive" });
        }
    };


    // --- Các hàm xử lý giao diện khác ---
    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedMonth(e.target.value);
    }

    const roleColors: Record<string, string> = {
        STAFF: "bg-blue-500",
        TECHNICIAN: "bg-green-500",
        // ADMIN không xuất hiện trong bảng lương nhưng cần định nghĩa để tránh lỗi TS
        ADMIN: "bg-red-500",
    };

    const totals = useMemo(() => {
        return salaries.reduce((acc, current) => {
            acc.totalBaseSalary += current.baseSalary;
            acc.totalBonus += current.bonus;
            acc.totalFinalSalary += current.totalSalary;
            return acc;
        }, {
            totalBaseSalary: 0,
            totalBonus: 0,
            totalFinalSalary: 0,
        });
    }, [salaries]);


    return (
        <div className="space-y-6">
            {/* --- Header và Bộ lọc --- */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">💵 Quản lý lương nhân viên</h2>
                    <p className="text-muted-foreground">
                        Xem và quản lý lương cơ bản và tỷ lệ thưởng của nhân viên/kỹ thuật viên.
                    </p>
                </div>

                <div className="flex space-x-2">
                    {/* Nút chỉnh sửa PHẦN TRĂM THƯỞNG */}
                    <Dialog open={isCommissionEditOpen} onOpenChange={setIsCommissionEditOpen}>
                        <DialogTrigger asChild>
                            <Button variant="secondary">
                                <Percent className="h-4 w-4 mr-2" />
                                Sửa % Thưởng (Tech)
                            </Button>
                        </DialogTrigger>
                        {/* Dialog Chỉnh Sửa % Thưởng */}
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Cập Nhật Tỷ Lệ Hoa Hồng Kỹ Thuật Viên</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Tỷ lệ thưởng hiện tại: **{(commissionRate * 100).toFixed(2)}%**
                                </p>
                                <div>
                                    <Label htmlFor="newCommissionRate">Tỷ lệ thưởng mới (theo %)</Label>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            id="newCommissionRate"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            placeholder="Ví dụ: 35.5"
                                            value={(newCommissionRate * 100)} // Hiển thị dưới dạng %
                                            onChange={(e) => setNewCommissionRate(Number(e.target.value) / 100)} // Chuyển lại thành thập phân
                                        />
                                        <span className="text-lg font-semibold">%</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Giá trị này sẽ được nhân với tổng giá trị ticket kỹ thuật viên thực hiện.
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCommissionEditOpen(false)}>
                                    Hủy
                                </Button>
                                <Button onClick={saveCommissionRate} disabled={newCommissionRate < 0 || newCommissionRate > 1}>
                                    Áp Dụng Tỷ Lệ
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Nút chỉnh sửa CHUNG THEO ROLE (giữ nguyên) */}
                    <Dialog open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Users className="h-4 w-4 mr-2" />
                                Sửa Lương Chung
                            </Button>
                        </DialogTrigger>
                        {/* Dialog Chỉnh Sửa Lương CHUNG */}
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Cập Nhật Lương Cơ Bản Theo Vai Trò</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Chọn Vai Trò</Label>
                                    <Select onValueChange={handleRoleChange} value={bulkUpdate.role}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn vai trò" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="STAFF">Nhân viên (STAFF)</SelectItem>
                                            <SelectItem value="TECHNICIAN">Kỹ thuật viên (TECHNICIAN)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="bulkBaseSalary">Lương cơ bản mới (VND)</Label>
                                    <Input
                                        id="bulkBaseSalary"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="Ví dụ: 10,000,000"
                                        value={bulkUpdate.baseSalary > 0 ? bulkUpdate.baseSalary.toLocaleString('vi-VN') : ''}
                                        onChange={handleBulkSalaryChange}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Áp dụng mức lương này cho **tất cả** nhân viên thuộc vai trò đã chọn.
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsBulkEditOpen(false)}>
                                    Hủy
                                </Button>
                                <Button onClick={saveBulkBaseSalary} disabled={!bulkUpdate.baseSalary || bulkUpdate.baseSalary <= 0}>
                                    Áp Dụng Lương
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex flex-col gap-2 w-48">
                    <Label htmlFor="salary-month">Chọn tháng</Label>
                    <Input
                        id="salary-month"
                        type="month"
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        max={defaultMonth}
                    />
                </div>
            </div>

            <hr className="my-4"/>

            {/* --- Thống kê (giữ nguyên) --- */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Base Salary</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrencyVND(totals.totalBaseSalary)}</div>
                        <p className="text-xs text-muted-foreground">Lương cơ bản tổng cộng</p>
                    </CardContent>
                </Card>
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bonus</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrencyVND(totals.totalBonus)}</div>
                        <p className="text-xs text-muted-foreground">Tổng thưởng trong tháng</p>
                    </CardContent>
                </Card>
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Final Salary</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrencyVND(totals.totalFinalSalary)}</div>
                        <p className="text-xs text-muted-foreground">Tổng lương chi trả</p>
                    </CardContent>
                </Card>
            </div>

            <hr className="my-4"/>

            {/* --- Bảng chi tiết lương (giữ nguyên) --- */}
            <Card>
                <CardHeader>
                    <CardTitle>Chi tiết lương tháng {selectedMonth}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-10">Đang tải dữ liệu lương...</div>
                    ) : salaries.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            Không tìm thấy dữ liệu lương cho tháng {selectedMonth}.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Họ và Tên</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Lương cơ bản</TableHead>
                                    <TableHead className="text-right">Thưởng</TableHead>
                                    <TableHead className="text-right">Tổng lương</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {salaries.map((item) => (
                                    <TableRow key={item.userId}>
                                        <TableCell>{item.userId}</TableCell>
                                        <TableCell className="font-medium">{item.fullName}</TableCell>
                                        <TableCell>
                                            <Badge className={roleColors[item.role]}>
                                                {item.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{formatCurrencyVND(item.baseSalary)}</TableCell>
                                        <TableCell className="text-right">{formatCurrencyVND(item.bonus)}</TableCell>
                                        <TableCell className="text-right font-bold text-lg text-primary">
                                            {formatCurrencyVND(item.totalSalary)}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditDialog(item)}
                                                // Đã khắc phục lỗi TS2367: Nếu item.role không phải ADMIN
                                                disabled={item.role === 'ADMIN' || item.role === undefined}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* --- Dialog Chỉnh Sửa Lương TỪNG NGƯỜI (giữ nguyên) --- */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chỉnh Sửa Lương Cơ Bản</DialogTitle>
                    </DialogHeader>
                    {editingUser && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Đang chỉnh sửa lương cho: <strong>{editingUser.fullName}</strong> ({editingUser.role})
                            </p>
                            <div>
                                <Label htmlFor="newBaseSalary">Lương cơ bản mới (VND)</Label>
                                <Input
                                    id="newBaseSalary"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Ví dụ: 10000000"
                                    value={editingUser.newBaseSalary > 0 ? editingUser.newBaseSalary.toLocaleString('vi-VN') : ''}
                                    onChange={handleBaseSalaryChange}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Lương hiện tại: {formatCurrencyVND(editingUser.baseSalary)}
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button onClick={saveBaseSalary}>
                            Lưu
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}