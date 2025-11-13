import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Wrench, CheckCircle, Clock } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";

export default function TechnicianDashboard() {
  const { toast } = useToast();
  const currentUser = authService.getCurrentUser();
  const [stats, setStats] = useState({
    assignedAppointments: 0,
    activeTickets: 0,
    completedToday: 0,
    pendingTasks: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [appointmentsRes, ticketsRes] = await Promise.all([
          api.get("/api/appointments/technician"),
          api.get("/api/service-tickets"),
        ]);

        const myAppointments = appointmentsRes.data.filter(
          (a: any) => a.technicianId === currentUser?.id
        );
        const myTickets = ticketsRes.data.filter(
          (t: any) => t.appointment?.technicianId === currentUser?.id
        );

        const completedToday = myTickets.filter((t: any) => 
          t.status === "COMPLETED" && 
          new Date(t.endTime).toDateString() === new Date().toDateString()
        ).length;

        const activeTickets = myTickets.filter((t: any) => t.status === "IN_PROGRESS").length;
        const pendingTasks = myAppointments.filter((a: any) => 
          a.status === "CONFIRMED" || a.status === "CHECKED_IN"
        ).length;

        setStats({
          assignedAppointments: myAppointments.length,
          activeTickets,
          completedToday,
          pendingTasks,
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
  }, []);

  const statCards = [
    {
      title: "Assigned Appointments",
      value: stats.assignedAppointments,
      icon: Calendar,
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
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      icon: Clock,
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Technician Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {currentUser?.fullName}
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
