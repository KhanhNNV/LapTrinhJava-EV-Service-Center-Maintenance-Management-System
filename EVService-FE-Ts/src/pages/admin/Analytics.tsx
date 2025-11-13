import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, DollarSign, Users, Wrench, Calendar, Package } from "lucide-react";

export default function AdminAnalytics() {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    activeCustomers: 0,
    totalServiceTickets: 0,
    averageServiceTime: 0,
    topServices: [] as any[],
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [appointmentsRes, ticketsRes, usersRes] = await Promise.all([
        api.get("/api/appointments"),
        api.get("/api/service-tickets"),
        api.get("/api/users/role/CUSTOMER"),
      ]);

      const appointments = appointmentsRes.data;
      const tickets = ticketsRes.data;
      const completedTickets = tickets.filter((t: any) => t.status === "COMPLETED");

      const totalRevenue = completedTickets.reduce((sum: number, t: any) => sum + (t.totalCost || 0), 0);
      const monthlyRevenue = completedTickets
        .filter((t: any) => {
          const date = new Date(t.endTime);
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        })
        .reduce((sum: number, t: any) => sum + (t.totalCost || 0), 0);

      const completedAppointments = appointments.filter((a: any) => a.status === "COMPLETED").length;

      setAnalytics({
        totalRevenue,
        monthlyRevenue,
        totalAppointments: appointments.length,
        completedAppointments,
        activeCustomers: usersRes.data.length,
        totalServiceTickets: tickets.length,
        averageServiceTime: completedTickets.length > 0 
          ? completedTickets.reduce((sum: number, t: any) => {
              const start = new Date(t.startTime).getTime();
              const end = new Date(t.endTime).getTime();
              return sum + (end - start) / (1000 * 60 * 60);
            }, 0) / completedTickets.length
          : 0,
        topServices: [],
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch analytics",
        variant: "destructive",
      });
    }
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${analytics.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-500",
      description: "All time",
    },
    {
      title: "Monthly Revenue",
      value: `$${analytics.monthlyRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-blue-500",
      description: "This month",
    },
    {
      title: "Total Appointments",
      value: analytics.totalAppointments,
      icon: Calendar,
      color: "text-purple-500",
      description: `${analytics.completedAppointments} completed`,
    },
    {
      title: "Active Customers",
      value: analytics.activeCustomers,
      icon: Users,
      color: "text-orange-500",
      description: "Registered users",
    },
    {
      title: "Service Tickets",
      value: analytics.totalServiceTickets,
      icon: Wrench,
      color: "text-cyan-500",
      description: "Total processed",
    },
    {
      title: "Avg Service Time",
      value: `${analytics.averageServiceTime.toFixed(1)}h`,
      icon: Package,
      color: "text-pink-500",
      description: "Per service",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics & Reports</h2>
        <p className="text-muted-foreground">
          Business insights and performance metrics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart placeholder - Revenue over time
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointments by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart placeholder - Appointment distribution
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
