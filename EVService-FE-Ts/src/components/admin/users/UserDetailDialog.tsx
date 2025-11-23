// src/components/admin/users/UserDetailDialog.tsx

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
    User, Mail, Phone, MapPin, Calendar, Car,
    Wrench, BadgeCheck,
    Clock, Activity, Shield,
    CheckCircle2, DollarSign,
    Building2
} from 'lucide-react';
import { format } from 'date-fns';

// --- Services ---
import { userService } from '@/services/userService';
import { appointmentService } from '@/services/appointmentService';
import { vehicleService } from '@/services/vehicleService';
import { getInvoicesByUserId } from '@/services/customerInvoices';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// --- HELPER FUNCTIONS ---
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

const formatDate = (dateString?: string, includeTime: boolean = false) => {
    if (!dateString) return "N/A";
    try {
        return format(new Date(dateString), includeTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy');
    } catch {
        return dateString;
    }
};

const renderStatusBadge = (status: string) => {
    const s = status?.toUpperCase();
    if (['COMPLETED', 'PAID', 'CONFIRMED', 'ACTIVE', 'SUCCESS'].includes(s)) {
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">{status}</Badge>;
    }
    if (['CANCELED', 'CANCELLED', 'REJECTED', 'INACTIVE', 'FAILED'].includes(s)) {
        return <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">{status}</Badge>;
    }
    return <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">{status}</Badge>;
};

// --- UI COMPONENTS ---

const StatCard = ({ title, value, icon: Icon, colorClass, subtext }: any) => (
    <div className="bg-white p-5 rounded-xl border shadow-sm flex items-start justify-between transition-all hover:shadow-md">
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClass}`}>
            <Icon className="w-6 h-6" />
        </div>
    </div>
);

const ProfileRow = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-center py-3 border-b border-dashed last:border-0">
        <div className="flex items-center gap-3 w-1/3 text-gray-500">
            <Icon className="w-4 h-4" />
            <span className="text-sm">{label}</span>
        </div>
        <span className="text-sm font-medium text-gray-900 w-2/3 truncate">{value || '---'}</span>
    </div>
);

interface UserDetailDialogProps {
    user: any | null;
    isOpen: boolean;
    onClose: () => void;
}

const UserDetailDialog: React.FC<UserDetailDialogProps> = ({ user, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedVehicleHistory, setSelectedVehicleHistory] = useState<any | null>(null);

    // 1. Lấy xe (Customer)
    const { data: vehicles = [] } = useQuery({
        queryKey: ['admin-user-vehicles', user?.userId],
        queryFn: async () => {
            return await vehicleService.getVehiclesByUserId(user.userId);
        },
        enabled: !!user && user.role === 'CUSTOMER' && isOpen
    });

    // 2. Lấy lịch sử xe (Khi chọn xe cụ thể)
    const { data: vehicleTickets = [], isLoading: isLoadingVehicleTickets } = useQuery({
        queryKey: ['admin-vehicle-tickets', selectedVehicleHistory?.vehicleId],
        queryFn: async () => {
            if (!selectedVehicleHistory?.vehicleId) return [];
            return await vehicleService.getVehicleHistory(selectedVehicleHistory.vehicleId);
        },
        enabled: !!selectedVehicleHistory?.vehicleId && isOpen
    });

    // 3. Lấy lịch sử chung (Overview & Appointments)
    const { data: historyList = [] } = useQuery({
        queryKey: ['admin-user-history', user?.userId],
        queryFn: async () => {
            if (!user) return [];
            switch (user.role) {
                case 'CUSTOMER':
                    return await appointmentService.getCustomerHistory(user.userId);
                case 'TECHNICIAN':
                    return await appointmentService.getTechnicianHistory(user.userId);
                case 'STAFF':
                    return await appointmentService.getStaffHistory(user.userId);
                default:
                    return [];
            }
        },
        enabled: !!user && isOpen
    });

    // 4. Lấy danh sách hóa đơn (Khi tab 'payments' active)
    const { data: userInvoices = [], isLoading: isLoadingInvoices } = useQuery({
        queryKey: ['admin-user-invoices', user?.userId],
        queryFn: async () => {
            if (!user?.userId) return [];
            return await getInvoicesByUserId(user.userId);
        },
        enabled: !!user && activeTab === 'payments' && isOpen
    });

    // 5. Chứng chỉ (Technician)
    const { data: certificates = [] } = useQuery({
        queryKey: ['admin-tech-certificates', user?.userId],
        queryFn: async () => {
            return await userService.getCertificatesByUserId(user.userId);
        },
        enabled: !!user && user.role === 'TECHNICIAN' && isOpen
    });

    const calculateTotalSpent = (invoices: any[]) => {
        if (!invoices || invoices.length === 0) return 0;

        return invoices.reduce((sum: number, inv: any) => {
            // Chỉ cộng những hóa đơn đã thanh toán (PAID)
            if (inv.paymentStatus === 'PAID') {
                // Sử dụng grandTotal (từ InvoiceDto) hoặc totalAmount (fallback)
                const amount = inv.grandTotal || inv.totalAmount || 0;
                return sum + amount;
            }
            return sum;
        }, 0);
    };
    // --- DATA PROCESSING ---
    const stats = useMemo(() => {
        if (!user) return {};

        if (user.role === 'CUSTOMER') {
            const totalSpent = calculateTotalSpent(userInvoices);
            
            const completedAppts = historyList.filter((a: any) => ['COMPLETED', 'PAID', 'CONFIRMED'].includes(a.status)).length;

            return {
                card1: { title: "Tổng chi tiêu", value: formatCurrency(totalSpent), icon: DollarSign, color: "bg-emerald-100 text-emerald-600" },
                card2: { title: "Số lượng xe", value: vehicles.length, icon: Car, color: "bg-blue-100 text-blue-600" },
                card3: { title: "Lịch hẹn hoàn tất", value: `${completedAppts} / ${historyList.length}`, icon: CheckCircle2, color: "bg-purple-100 text-purple-600" }
            };
        }

        if (user.role === 'TECHNICIAN') {
            const completedTickets = historyList.filter((t: any) => t.status === 'COMPLETED').length;
            const hoursEstimate = completedTickets * 2;

            return {
                card1: { title: "Phiếu hoàn thành", value: completedTickets, icon: Wrench, color: "bg-blue-100 text-blue-600" },
                card2: { title: "Chứng chỉ", value: certificates.length, icon: BadgeCheck, color: "bg-orange-100 text-orange-600" },
                card3: { title: "Giờ làm (Ước tính)", value: `${hoursEstimate}h`, icon: Clock, color: "bg-indigo-100 text-indigo-600" }
            };
        }

        if (user.role === 'STAFF') {
            const handledAppts = historyList.length;
            const todayAppts = historyList.filter((a: any) => {
                const date = a.createdAt || a.appointmentDate;
                return new Date(date).toDateString() === new Date().toDateString();
            }).length;

            return {
                card1: { title: "Lịch hẹn đã xử lý", value: handledAppts, icon: Calendar, color: "bg-blue-100 text-blue-600" },
                card2: { title: "Xử lý hôm nay", value: todayAppts, icon: Activity, color: "bg-green-100 text-green-600" },
                card3: { title: "Nghỉ phép (tháng)", value: `0`, icon: Clock, color: "bg-indigo-100 text-indigo-600" }
            };
        }
        return {};
    }, [user, historyList, vehicles, certificates]);

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[97vw] w-[1500px] h-[95vh] p-0 gap-0 flex flex-col bg-gray-50 overflow-hidden border-none shadow-2xl">

                {/* === HEADER === */}
                <div className="bg-white px-8 py-5 border-b flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                {user.fullName}
                            </h2>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> {user.role}</span>
                                <span className="w-px h-3 bg-gray-300"></span>
                                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* === NAVIGATION TABS === */}
                <div className="bg-white px-8 border-b shrink-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-transparent p-0 h-12 gap-6 w-full justify-start">
                            <TabsTrigger value="overview" className="h-full rounded-none border-b-[3px] border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 font-medium">Tổng quan</TabsTrigger>

                            {user.role === 'CUSTOMER' && (
                                <>
                                    <TabsTrigger value="appointments" className="h-full rounded-none border-b-[3px] border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 font-medium">Lịch hẹn</TabsTrigger>
                                    <TabsTrigger value="vehicles" className="h-full rounded-none border-b-[3px] border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 font-medium">Phương tiện ({vehicles.length})</TabsTrigger>
                                    <TabsTrigger value="payments" className="h-full rounded-none border-b-[3px] border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 font-medium">Thanh toán</TabsTrigger>
                                </>
                            )}

                            {user.role === 'TECHNICIAN' && (
                                <>
                                    <TabsTrigger value="tech_history" className="h-full rounded-none border-b-[3px] border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 font-medium">Lịch sử sửa xe</TabsTrigger>
                                    <TabsTrigger value="certificates" className="h-full rounded-none border-b-[3px] border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 font-medium">Chứng chỉ</TabsTrigger>
                                </>
                            )}

                            {user.role === 'STAFF' && (
                                <TabsTrigger value="staff_history" className="h-full rounded-none border-b-[3px] border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 font-medium">Lịch sử xử lý</TabsTrigger>
                            )}
                        </TabsList>
                    </Tabs>
                </div>

                {/* === CONTENT AREA === */}
                <ScrollArea className="flex-1 bg-gray-50/50">
                    <div className="p-8 max-w-[1400px] mx-auto">

                        {/* 1. TAB TỔNG QUAN */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Stats Cards */}
                                {user.role !== 'ADMIN' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <StatCard {...stats.card1} />
                                        <StatCard {...stats.card2} />
                                        <StatCard {...stats.card3} />
                                    </div>
                                )}

                                {/* Profile Info */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-1">
                                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <User className="w-5 h-5 text-blue-600" /> Thông tin cá nhân
                                            </h3>
                                            <div className="space-y-1">
                                                <ProfileRow icon={User} label="Tên đầy đủ" value={user.fullName} />
                                                <ProfileRow icon={User} label="Username" value={user.username} />
                                                <ProfileRow icon={Phone} label="Điện thoại" value={user.phoneNumber} />
                                                <ProfileRow icon={Mail} label="Email" value={user.email} />
                                                <ProfileRow icon={MapPin} label="Địa chỉ" value={user.address} />
                                                <ProfileRow icon={Calendar} label="Ngày tạo" value={formatDate(user.createdAt)} />
                                                {user.centerName && <ProfileRow icon={Building2} label="Chi nhánh" value={user.centerName} />}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2">
                                        <div className="bg-white p-6 rounded-xl shadow-sm border h-full">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                    <Activity className="w-5 h-5 text-blue-600" /> Hoạt động gần đây
                                                </h3>
                                                <Button variant="link" size="sm" onClick={() => setActiveTab(user.role === 'CUSTOMER' ? 'appointments' : 'tech_history')}>Xem tất cả</Button>
                                            </div>

                                            <div className="space-y-6 relative pl-4 border-l border-gray-200 ml-2">
                                                {historyList.slice(0, 3).map((item: any, idx: number) => (
                                                    <div key={idx} className="relative pl-6">
                                                        <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                                                        <div className="bg-gray-50 p-4 rounded-lg border hover:bg-blue-50/50 transition-colors">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className="font-semibold text-gray-900">{item.serviceType || item.appointment?.serviceType || "Dịch vụ"}</p>
                                                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                                                        <Clock className="w-3 h-3" /> {formatDate(item.appointmentDate || item.startTime, true)}
                                                                    </p>
                                                                </div>
                                                                {renderStatusBadge(item.status)}
                                                            </div>
                                                            <div className="mt-2 flex gap-3 text-sm text-gray-600">
                                                                {item.vehicle && (
                                                                    <span className="bg-white px-2 py-1 rounded border flex items-center gap-1">
                                                                        <Car className="w-3 h-3" /> {item.vehicle.brand} {item.vehicle.model}
                                                                    </span>
                                                                )}
                                                                {item.technicianName && (
                                                                    <span className="bg-white px-2 py-1 rounded border flex items-center gap-1" title="Kỹ thuật viên">
                                                                        <Wrench className="w-3 h-3" /> {item.technicianName}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {historyList.length === 0 && <p className="text-gray-500 text-center italic">Chưa có hoạt động nào.</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. TAB VEHICLES (CUSTOMER) */}
                        {activeTab === 'vehicles' && (
                            <div className="space-y-6 animate-in fade-in">
                                {!selectedVehicleHistory ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {vehicles.map((v: any) => (
                                            <div key={v.vehicleId}
                                                className="bg-white p-5 rounded-xl border hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                                                onClick={() => setSelectedVehicleHistory(v)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-4">
                                                        <div className="h-14 w-14 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                            <Car className="w-7 h-7" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-lg text-gray-900">{v.brand} {v.model}</h4>
                                                            <div className="flex gap-2 mt-1">
                                                                <Badge variant="secondary" className="font-mono">{v.licensePlate}</Badge>
                                                                <Badge variant="outline">{v.vehicleType}</Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="text-blue-600">Lịch sử &rarr;</Button>
                                                </div>
                                                <div className="mt-4 pt-4 border-t text-sm text-gray-500 flex justify-between">
                                                    <span>VIN: {v.vehicleId}</span>
                                                    <span className="flex items-center gap-1"><Wrench className="w-3 h-3" /> Bảo dưỡng: {formatDate(v.recentMaintenanceDate)}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {vehicles.length === 0 && <div className="col-span-2 text-center py-12 text-gray-500 border-dashed border-2 rounded-xl">Khách hàng chưa đăng ký xe nào.</div>}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                <Car className="w-5 h-5 text-blue-600" />
                                                Lịch sử xe: {selectedVehicleHistory.licensePlate}
                                            </h3>
                                            <Button variant="outline" size="sm" onClick={() => setSelectedVehicleHistory(null)}>Quay lại</Button>
                                        </div>
                                        {isLoadingVehicleTickets ? (
                                            <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Ngày</TableHead>
                                                        <TableHead>Dịch vụ</TableHead>
                                                        <TableHead>Kỹ thuật viên</TableHead>
                                                        <TableHead>Chi phí</TableHead>
                                                        <TableHead>Trạng thái</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {vehicleTickets.map((h: any) => (
                                                        <TableRow key={h.ticketId || h.appointmentId}>
                                                            <TableCell>{formatDate(h.startTime)}</TableCell>
                                                            <TableCell className="font-medium">{h.serviceType}</TableCell>
                                                            <TableCell>
                                                                {h.technicianName ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <User className="w-3 h-3 text-gray-400" />
                                                                        {h.technicianName}
                                                                    </div>
                                                                ) : (h.technicianId ? `ID: ${h.technicianId}` : "---")}
                                                            </TableCell>
                                                            <TableCell>{h.invoice?.totalAmount ? formatCurrency(h.invoice.totalAmount) : "---"}</TableCell>
                                                            <TableCell>{renderStatusBadge(h.status)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {vehicleTickets.length === 0 && (
                                                        <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Chưa có lịch sử sửa chữa cho xe này.</TableCell></TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 3. TAB THANH TOÁN */}
                        {activeTab === 'payments' && (
                            <div className="bg-white rounded-xl shadow-sm border overflow-hidden animate-in fade-in">
                                {isLoadingInvoices ? (
                                    <div className="p-8 text-center text-gray-500">Đang tải hóa đơn...</div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50">
                                                <TableHead>Mã hóa đơn</TableHead>
                                                <TableHead>Ngày tạo</TableHead>
                                                <TableHead>Khách hàng</TableHead>
                                                <TableHead>Thu ngân</TableHead>
                                                <TableHead>Số tiền</TableHead>
                                                <TableHead>Trạng thái</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {userInvoices.map((inv: any) => (
                                                <TableRow key={inv.id || inv.invoiceId}>
                                                    <TableCell className="font-mono text-xs">#{inv.id || inv.invoiceId}</TableCell>
                                                    <TableCell>{formatDate(inv.completedTime || inv.invoiceDate, true)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{inv.customerName}</span>
                                                            <span className="text-xs text-gray-500">{inv.customerPhone}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {inv.staffName ? (
                                                            <div className="flex flex-col"><span className="text-sm">{inv.staffName}</span></div>
                                                        ) : "---"}
                                                    </TableCell>
                                                    <TableCell className="font-bold text-emerald-600">
                                                        {formatCurrency(inv.grandTotal || inv.totalAmount)}
                                                    </TableCell>
                                                    <TableCell>{renderStatusBadge(inv.paymentStatus)}</TableCell>
                                                </TableRow>
                                            ))}
                                            {userInvoices.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Không có dữ liệu thanh toán.</TableCell></TableRow>}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        )}

                        {/* 4. TAB LỊCH HẸN / STAFF HISTORY */}
                        {(activeTab === 'appointments' || activeTab === 'staff_history') && (
                            <div className="bg-white rounded-xl shadow-sm border overflow-hidden animate-in fade-in">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead>Thời gian</TableHead>
                                            <TableHead>Dịch vụ</TableHead>
                                            <TableHead>Phương tiện</TableHead>
                                            {user.role === 'STAFF' && <TableHead>Khách hàng</TableHead>}
                                            <TableHead>Phụ trách</TableHead>
                                            <TableHead>Ghi chú</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {historyList.map((h: any) => (
                                            <TableRow key={h.appointmentId}>
                                                <TableCell>{formatDate(h.appointmentDate)} <span className="text-gray-400">{h.appointmentTime}</span></TableCell>
                                                <TableCell className="font-medium">{h.serviceType}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span>{h.vehicle?.licensePlate}</span>
                                                        <span className="text-xs text-gray-400">{h.vehicle?.brand} {h.vehicle?.model}</span>
                                                    </div>
                                                </TableCell>

                                                {user.role === 'STAFF' && <TableCell>{h.customerName}</TableCell>}

                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        {user.role === 'STAFF' && h.technicianName && (
                                                            <span className="text-xs flex items-center gap-1 text-blue-600" title="Kỹ thuật viên">
                                                                <Wrench className="w-3 h-3" /> {h.technicianName}
                                                            </span>
                                                        )}
                                                        {user.role === 'CUSTOMER' && (
                                                            <>
                                                                {h.staffName && <span className="text-xs flex items-center gap-1 text-gray-600" title="Nhân viên xếp lịch"><User className="w-3 h-3" /> {h.staffName}</span>}
                                                                {h.technicianName && <span className="text-xs flex items-center gap-1 text-blue-600" title="Kỹ thuật viên"><Wrench className="w-3 h-3" /> {h.technicianName}</span>}
                                                            </>
                                                        )}
                                                        {!h.staffName && !h.technicianName && "---"}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="max-w-xs truncate text-gray-500" title={h.note}>{h.note || '---'}</TableCell>
                                                <TableCell>{renderStatusBadge(h.status)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {historyList.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">Chưa có lịch hẹn nào.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* 5. TAB LỊCH SỬ TECHNICIAN */}
                        {activeTab === 'tech_history' && (
                            <div className="space-y-4 animate-in fade-in">
                                {historyList.map((ticket: any) => (
                                    <div key={ticket.ticketId} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between border-b pb-3 mb-3">
                                            <div className="flex gap-3 items-center">
                                                <div className="bg-purple-50 p-2 rounded text-purple-600"><Wrench className="w-5 h-5" /></div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">Ticket #{ticket.ticketId}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5" /> {formatDate(ticket.startTime, true)}
                                                        </p>
                                                        {ticket.staffName && (
                                                            <p className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                                                                <User className="w-3 h-3" /> Staff: {ticket.staffName}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {renderStatusBadge(ticket.status)}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Thông tin xe & Khách hàng</p>
                                                <div className="bg-gray-50 p-3 rounded text-sm border">
                                                    <div className="flex justify-between items-center mb-2 border-b pb-2 border-dashed">
                                                        <span className="font-bold text-gray-900">{ticket.customerName || ticket.appointment?.user?.fullName || "Khách vãng lai"}</span>
                                                        <Badge variant="outline" className="text-[10px]">{ticket.appointment?.vehicle?.vehicleType || "Xe"}</Badge>
                                                    </div>
                                                    <p className="font-medium text-gray-800 flex items-center gap-2">
                                                        <Car className="w-4 h-4 text-gray-500" />
                                                        {ticket.licensePlate || ticket.appointment?.vehicle?.licensePlate}
                                                    </p>
                                                    <p className="text-gray-500 text-xs mt-1 ml-6">
                                                        {ticket.appointment?.vehicle?.brand} {ticket.appointment?.vehicle?.model}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Công việc thực hiện</p>
                                                <ul className="text-sm space-y-1">
                                                    {ticket.items?.map((i: any, idx: number) => (
                                                        <li key={idx} className="flex justify-between"><span>- {i.itemName}</span> <span className="text-gray-400">x{i.quantity}</span></li>
                                                    ))}
                                                    {ticket.parts?.map((p: any, idx: number) => (
                                                        <li key={idx} className="flex justify-between text-blue-600"><span>+ {p.partName}</span> <span>x{p.quantity}</span></li>
                                                    ))}
                                                    {!ticket.items?.length && !ticket.parts?.length && <li className="text-gray-400 italic">Chưa có chi tiết công việc</li>}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {historyList.length === 0 && <div className="text-center py-12 text-gray-500 border-dashed border-2 rounded-xl">Chưa có lịch sử sửa chữa.</div>}
                            </div>
                        )}

                        {/* 6. TAB CHỨNG CHỈ (TECHNICIAN) */}
                        {activeTab === 'certificates' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
                                {certificates.map((c: any) => {
                                    const isExpired = new Date(c.expiryDate) < new Date();
                                    return (
                                        <div key={c.certificateId} className="bg-white border rounded-xl p-5 shadow-sm relative overflow-hidden">
                                            <div className={`absolute top-0 left-0 w-1.5 h-full ${isExpired ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                            <div className="flex justify-between items-start mb-4">
                                                <BadgeCheck className={`w-10 h-10 ${isExpired ? 'text-red-200' : 'text-green-200'}`} />
                                                <Badge variant={isExpired ? "destructive" : "outline"} className={!isExpired ? "text-green-700 bg-green-50 border-green-200" : ""}>
                                                    {isExpired ? "Hết hạn" : "Hiệu lực"}
                                                </Badge>
                                            </div>
                                            <h4 className="font-bold text-lg text-gray-900">{c.certificateName}</h4>
                                            <p className="text-sm text-gray-500 mt-1">{c.issuingOrganization}</p>
                                            <div className="mt-4 pt-4 border-t flex justify-between text-sm">
                                                <span className="text-gray-500">Hết hạn:</span>
                                                <span className="font-mono font-medium">{formatDate(c.expiryDate)}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                                {certificates.length === 0 && <div className="col-span-3 text-center py-12 text-gray-500 border-dashed border-2 rounded-xl">Chưa có chứng chỉ nào.</div>}
                            </div>
                        )}

                    </div>
                </ScrollArea>

            </DialogContent>
        </Dialog>
    );
};

export default UserDetailDialog;