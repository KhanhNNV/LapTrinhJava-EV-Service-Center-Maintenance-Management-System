import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Wrench, CheckCircle } from "lucide-react";
import api from "@/services/auth/api";
import { useToast } from "@/hooks/use-toast";

export default function StaffDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    pendingAppointments: 0,
    totalCustomers: 0,
    activeTickets: 0,
    completedToday: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [appointmentsRes, usersRes, ticketsRes] = await Promise.all([
          api.get("/api/appointments"),
          api.get("/api/users"),
          api.get("/api/service-tickets"),
        ]);

        const appointments = appointmentsRes.data;
        const pending = appointments.filter((a: any) => a.status === "PENDING").length;
        const completedToday = appointments.filter((a: any) => 
          a.status === "COMPLETED" && 
          new Date(a.updatedAt).toDateString() === new Date().toDateString()
        ).length;

        const customers = usersRes.data.filter((u: any) => u.role === "CUSTOMER");
        const activeTickets = ticketsRes.data.filter((t: any) => t.status === "IN_PROGRESS").length;

        setStats({
          pendingAppointments: pending,
          totalCustomers: customers.length,
          activeTickets,
          completedToday,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch dashboard stats",
          variant: "destructive",
        });
      }
    };

    fetchStats();
  }, [toast]);

  const statCards = [
    {
      title: "Pending Appointments",
      value: stats.pendingAppointments,
      icon: Calendar,
      color: "text-yellow-500",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Active Tickets",
      value: stats.activeTickets,
      icon: Wrench,
      color: "text-orange-500",
    },
    {
      title: "Completed Today",
      value: stats.completedToday,
      icon: CheckCircle,
      color: "text-green-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Staff Dashboard</h2>
        <p className="text-muted-foreground">
          Manage appointments, customers, and service tickets
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
