import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Users,
  Wrench,
  CheckCircle2,
  Clock,
  Car,
  TrendingUp,
  Activity,
  DollarSign,
} from "lucide-react";
import { format, formatDistanceToNow, isToday, startOfMonth } from "date-fns";
import { vi } from "date-fns/locale";

export default function StaffDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayTotal: 0,
    pending: 0,
    checkedInToday: 0,
    inProgress: 0,
    completedToday: 0,
    revenueToday: 0,
    newCustomersMonth: 0,
    upcoming: [] as any[],
    activities: [] as any[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Chỉ cần 1 API duy nhất: tất cả lịch hẹn
        const { data: appointments } = await api.get("/api/appointments");

        const today = new Date();
        const todayStr = format(today, "yyyy-MM-dd");
        const monthStart = startOfMonth(today);

        // Lọc dữ liệu hôm nay
        const todayApps = appointments.filter(
          (a: any) => a.appointmentDate === todayStr
        );

        const pending = appointments.filter(
          (a: any) => a.status === "PENDING"
        ).length;
        const checkedInToday = todayApps.filter(
          (a: any) => a.status === "CHECKED_IN"
        ).length;
        const inProgress = appointments.filter(
          (a: any) => a.status === "IN_PROGRESS"
        ).length;
        const completedToday = todayApps.filter(
          (a: any) => a.status === "COMPLETED"
        );

        // Ước tính doanh thu hôm nay (rất thực tế cho gara)
        const revenueToday = completedToday.reduce((sum: number, a: any) => {
          // Nếu backend có trả estimatedPrice thì dùng, không thì fallback trung bình 1.8tr/xe
          return sum + (a.estimatedPrice || a.packagePrice || 1800000);
        }, 0);

        // Khách mới tháng này: đếm khách có lịch đầu tiên trong tháng
        const customerFirstSeen = new Map();
        appointments.forEach((a: any) => {
          const first = customerFirstSeen.get(a.customerId);
          const date = new Date(a.appointmentDate);
          if (!first || date < first) {
            customerFirstSeen.set(a.customerId, date);
          }
        });
        const newCustomers = Array.from(customerFirstSeen.entries()).filter(
          ([_, firstDate]) => firstDate >= monthStart
        ).length;

        // 5 lịch sắp tới
        const upcoming = appointments
          .filter((a: any) => {
            const d = new Date(a.appointmentDate);
            return d >= today && ["PENDING", "CONFIRMED"].includes(a.status);
          })
          .sort(
            (a: any, b: any) =>
              new Date(a.appointmentDate + " " + a.appointmentTime).getTime() -
              new Date(b.appointmentDate + " " + b.appointmentTime).getTime()
          )
          .slice(0, 5);

        // Hoạt động gần đây
        const activities = appointments
          .sort(
            (a: any, b: any) =>
              new Date(b.updatedAt || b.createdAt).getTime() -
              new Date(a.updatedAt || a.createdAt).getTime()
          )
          .slice(0, 8)
          .map((a: any) => ({
            customer: a.customerName,
            action:
              {
                PENDING: "đặt lịch mới",
                CONFIRMED: "xác nhận lịch",
                CHECKED_IN: "nhận xe",
                IN_PROGRESS: "bắt đầu sửa chữa",
                COMPLETED: "hoàn thành dịch vụ",
              }[a.status] || a.status,
            time: formatDistanceToNow(new Date(a.updatedAt || a.createdAt), {
              addSuffix: true,
              locale: vi,
            }),
          }));

        setStats({
          todayTotal: todayApps.length,
          pending,
          checkedInToday,
          inProgress,
          completedToday: completedToday.length,
          revenueToday,
          newCustomersMonth: newCustomers,
          upcoming,
          activities,
        });
      } catch (err) {
        toast({
          title: "Lỗi",
          description: "Không tải được dữ liệu dashboard",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3600000); // refresh mỗi 1h
    return () => clearInterval(interval);
  }, []);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Đang tải dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Tổng quan</h1>
          <p className="text-muted-foreground mt-2">
            Hôm nay:{" "}
            <span className="font-semibold text-primary">
              {format(new Date(), "EEEE, dd/MM/yyyy", { locale: vi })}
            </span>
          </p>
        </div>
        <Badge variant="outline" className="px-4 py-2 text-lg">
          <Activity className="w-5 h-5 mr-2 text-green-500 animate-pulse" />
          Hoạt động
        </Badge>
      </div>

      {/* 4 ô chính đẹp mắt */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lịch hôm nay</CardTitle>
            <Calendar className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.todayTotal}</div>
            <p className="text-xs text-muted-foreground">cuộc hẹn</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đang sửa</CardTitle>
            <Wrench className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.inProgress}</div>
            <Progress value={(stats.inProgress / 10) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Hoàn thành hôm nay
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-green-600 mt-1">xe đã xong</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Doanh thu hôm nay
            </CardTitle>
            <DollarSign className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {formatVND(stats.revenueToday)}
            </div>
            <Badge variant="secondary" className="mt-2">
              <TrendingUp className="w-3 h-3 mr-1" /> Ước tính
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lịch sắp tới */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> Lịch hẹn sắp tới
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.upcoming.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">
                Không có lịch nào
              </p>
            ) : (
              stats.upcoming.map((a: any) => (
                <div
                  key={a.appointmentId}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{a.customerName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{a.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.appointmentTime} • {a.serviceType}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {a.status === "PENDING" ? "Chờ" : "Đã xác nhận"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Hoạt động gần đây */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" /> Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.activities.map((act, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <p>
                    <span className="font-medium">{act.customer}</span>{" "}
                    {act.action}
                    <span className="text-muted-foreground text-xs ml-2">
                      {act.time}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
