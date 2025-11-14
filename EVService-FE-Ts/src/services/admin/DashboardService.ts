// // src/services/adminDashboardService.ts
// import api from "@/lib/api";
// import { ENDPOINTS } from "@/config/endpoints";

// export interface AdminStats {
//   totalUsers: number;
//   serviceCenters: number;
//   partsInStock: number;
//   activePackages: number;
//   monthlyRevenue: number;
//   completedServices: number;
// }

// export async function fetchAdminStats(): Promise<AdminStats> {
//   const [usersRes, centersRes, partsRes, packagesRes, performanceRes] =
//     await Promise.all([
//       api.get(ENDPOINTS.users.search.url), // GET /api/users/search
//       api.get(ENDPOINTS.serviceCenters.list.url), // GET /api/service-centers
//       api.get(ENDPOINTS.parts.list.url), // GET /api/parts
//       api.get(ENDPOINTS.servicePackages.list.url), // GET /api/service-packages
//       api.get(ENDPOINTS.serviceTickets.performance.url), // GET /api/service-tickets/performance
//     ]);

//   const users = usersRes.data || [];
//   const centers = centersRes.data || [];
//   const parts = partsRes.data || [];
//   const packages = packagesRes.data || [];
//   const performance = performanceRes.data || [];

//   // tuỳ BE trả gì, ví dụ performance là mảng ticket
//   const completedTickets = performance.filter(
//     (t: any) => t.status === "COMPLETED"
//   );
//   const monthlyRevenue = completedTickets.reduce(
//     (sum: number, t: any) => sum + (t.totalCost || 0),
//     0
//   );

//   return {
//     totalUsers: users.length,
//     serviceCenters: centers.length,
//     partsInStock: parts.reduce(
//       (sum: number, p: any) => sum + (p.quantityInStock || 0),
//       0
//     ),
//     activePackages: packages.filter((p: any) => p.isActive).length,
//     monthlyRevenue,
//     completedServices: completedTickets.length,
//   };
// }

// // Usage in AdminDashboard.tsx
// // src/pages/admin/Dashboard.tsx
// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Users, Building2, Package, Wrench, TrendingUp, DollarSign } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { fetchAdminStats, AdminStats } from "@/services/adminDashboardService";

// export default function AdminDashboard() {
//   const { toast } = useToast();
//   const [stats, setStats] = useState<AdminStats>({
//     totalUsers: 0,
//     serviceCenters: 0,
//     partsInStock: 0,
//     activePackages: 0,
//     monthlyRevenue: 0,
//     completedServices: 0,
//   });

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const result = await fetchAdminStats();
//         setStats(result);
//       } catch (error) {
//         console.error(error);
//         toast({
//           title: "Error",
//           description: "Failed to fetch dashboard stats",
//           variant: "destructive",
//         });
//       }
//     };
//     load();
//   }, [toast]);

//   const statCards = [
//     {
//       title: "Total Users",
//       value: stats.totalUsers,
//       icon: Users,
//       color: "text-blue-500",
//       description: "All registered users",
//     },
//     {
//       title: "Service Centers",
//       value: stats.serviceCenters,
//       icon: Building2,
//       color: "text-green-500",
//       description: "Active locations",
//     },
//     {
//       title: "Parts in Stock",
//       value: stats.partsInStock,
//       icon: Package,
//       color: "text-orange-500",
//       description: "Total inventory",
//     },
//     {
//       title: "Active Packages",
//       value: stats.activePackages,
//       icon: Wrench,
//       color: "text-purple-500",
//       description: "Service packages",
//     },
//     {
//       title: "Monthly Revenue",
//       value: `$${stats.monthlyRevenue.toFixed(2)}`,
//       icon: DollarSign,
//       color: "text-green-600",
//       description: "This month",
//     },
//     {
//       title: "Completed Services",
//       value: stats.completedServices,
//       icon: TrendingUp,
//       color: "text-blue-600",
//       description: "This month",
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
//         <p className="text-muted-foreground">
//           Overview of system performance and key metrics
//         </p>
//       </div>

//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         {statCards.map((stat) => (
//           <Card key={stat.title}>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">
//                 {stat.title}
//               </CardTitle>
//               <stat.icon className={`h-4 w-4 ${stat.color}`} />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{stat.value}</div>
//               <p className="text-xs text-muted-foreground mt-1">
//                 {stat.description}
//               </p>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }
