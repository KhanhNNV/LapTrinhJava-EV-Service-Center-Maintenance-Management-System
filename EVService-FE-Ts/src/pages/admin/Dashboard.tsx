import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Package, Wrench, TrendingUp, DollarSign } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    serviceCenters: 0,
    partsInStock: 0,
    activePackages: 0,
    monthlyRevenue: 0,
    completedServices: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, centersRes, partsRes, packagesRes, ticketsRes] = await Promise.all([
          api.get("/api/users"),
          api.get("/api/service-centers"),
          api.get("/api/parts"),
          api.get("/api/service-packages"),
          api.get("/api/service-tickets"),
        ]);

        const completedTickets = ticketsRes.data.filter((t: any) => t.status === "COMPLETED");
        const monthlyRevenue = completedTickets.reduce((sum: number, t: any) => sum + (t.totalCost || 0), 0);

        setStats({
          totalUsers: usersRes.data.length,
          serviceCenters: centersRes.data.length,
          partsInStock: partsRes.data.reduce((sum: number, p: any) => sum + p.quantityInStock, 0),
          activePackages: packagesRes.data.filter((p: any) => p.isActive).length,
          monthlyRevenue,
          completedServices: completedTickets.length,
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
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
      description: "All registered users",
    },
    {
      title: "Service Centers",
      value: stats.serviceCenters,
      icon: Building2,
      color: "text-green-500",
      description: "Active locations",
    },
    {
      title: "Parts in Stock",
      value: stats.partsInStock,
      icon: Package,
      color: "text-orange-500",
      description: "Total inventory",
    },
    {
      title: "Active Packages",
      value: stats.activePackages,
      icon: Wrench,
      color: "text-purple-500",
      description: "Service packages",
    },
    {
      title: "Monthly Revenue",
      value: `$${stats.monthlyRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
      description: "This month",
    },
    {
      title: "Completed Services",
      value: stats.completedServices,
      icon: TrendingUp,
      color: "text-blue-600",
      description: "This month",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of system performance and key metrics
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
    </div>
  );
}
