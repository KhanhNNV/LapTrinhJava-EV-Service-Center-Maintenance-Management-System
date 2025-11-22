import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CustomerLayout } from "./layouts/CustomerLayout";
import { StaffLayout } from "./layouts/StaffLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { TechnicianLayout } from "./layouts/TechnicianLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/customer/Dashboard";
import Vehicles from "./pages/customer/Vehicles";
import Appointments from "./pages/customer/Appointments";
import History from "./pages/customer/History";
import Invoices from '@/pages/customer/Invoices.tsx';
import Notifications from "./pages/customer/Notifications";
import CustomerChat from "./pages/customer/CustomerChat";
import StaffDashboard from "./pages/staff/Dashboard";
import StaffAppointments from "./pages/staff/Appointments";
import StaffCustomers from "./pages/staff/Customers";
import StaffMessages from "./pages/staff/Messages";
import StaffNotifications from "./pages/staff/Notifications";
import AdminDashboard from "./pages/admin/Dashboard";
// import AdminUsers from "./pages/admin/Users"; // Cảnh báo/Lỗi: Unused/TS6133, đã xóa import
import AdminServiceCenters from "./pages/admin/ServiceCenters";
import InventoryManager from "./pages/admin/InventoryManager";
import AdminServicePackages from "./pages/admin/ServicePackages";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminNotifications from "./pages/admin/Notifications";
import TechnicianDashboard from "./pages/technician/Dashboard";
import TechnicianMyAppointments from "./pages/technician/MyAppointments";
import TechnicianServiceTickets from "./pages/technician/ServiceTickets";
import TechnicianNotifications from "./pages/technician/Notifications";
import NotFound from "./pages/NotFound";
import AuthCallbackPage from "./pages/auth/AuthCallbackPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import EmailVerificationSentPage from "./pages/auth/EmailVerificationSentPage";
import SettingsPage from "./pages/Setting";
import RoleBasedUserList from "./pages/admin/users/RoleBaseUserList";
import EmployeesSalary from "@/pages/admin/EmployeesSalary.tsx";
import Performance from "@/pages/admin/Performance.tsx";
import Details from "@/pages/admin/Profit.tsx";
import StaffQuotes from "./pages/staff/Quotes";
import PartsManagement from "@/pages/admin/PartsManagement.tsx";
import ServiceItemManagement from "@/pages/admin/ServiceItemManagement.tsx";
import TechnicianCertificates from "@/pages/technician/TechnicianCertificates.tsx";
// import {useCustomerInvoices} from "@/services/customerInvoices.ts"; // Cảnh báo/Lỗi: Unused/TS6133, đã xóa import

// KHẮC PHỤC LỖI TS2613: SỬ DỤNG NAMED IMPORT ({})
import { ServicesPage } from "./pages/ServicesPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";

// Dọn dẹp Imports không sử dụng (AdminUsers, useCustomerInvoices đã bị xóa)


const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/auth/callback" element={<AuthCallbackPage />} />
                    <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
                    <Route
                        path="/auth/email-verify-sent"
                        element={<EmailVerificationSentPage />}
                    />
                    <Route
                        path="/auth/forgot-password"
                        element={<ForgotPasswordPage />}
                    />
                    <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

                    {/* Public Routes for Marketing Pages */}
                    {/* KHẮC PHỤC LỖI LOGIC ROUTER: Đặt các route này trước NotFound */}
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />


                    {/* Customer Routes */}
                    <Route
                        path="/dashboard/customer"
                        element={
                            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                                <CustomerLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<CustomerDashboard />} />
                        <Route path="vehicles" element={<Vehicles />} />
                        <Route path="appointments" element={<Appointments />} />
                        <Route path="history" element={<History />} />
                        <Route path="payments" element={<Invoices />} />
                        <Route path="notifications" element={<Notifications />} />
                        <Route path="messages" element={<CustomerChat />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>

                    {/* Staff Routes */}
                    <Route
                        path="/dashboard/staff"
                        element={
                            <ProtectedRoute allowedRoles={["STAFF"]}>
                                <StaffLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<StaffDashboard />} />
                        <Route path="appointments" element={<StaffAppointments />} />
                        <Route path="customers" element={<StaffCustomers />} />
                        <Route path="quotes" element={<StaffQuotes />} />
                        <Route path="messages" element={<StaffMessages />} />
                        <Route path="notifications" element={<StaffNotifications />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route
                        path="/dashboard/admin"
                        element={
                            <ProtectedRoute allowedRoles={["ADMIN"]}>
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<AdminDashboard />} />

                        <Route path="service-centers" element={<AdminServiceCenters />} />
                        <Route path="inventory" element={<InventoryManager />} />
                        <Route path="packages" element={<AdminServicePackages />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route path="employees-salary" element={<EmployeesSalary />} />
                        <Route path="performance" element={<Performance />} />
                        <Route path="details" element={<Details />} />
                        <Route path="parts" element={<PartsManagement />} />
                        <Route path="serviceitems" element={<ServiceItemManagement />} />
                        <Route path="notifications" element={<AdminNotifications />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="users/:role" element={<RoleBasedUserList />} />

                    </Route>

                    {/* Technician Routes */}
                    <Route
                        path="/dashboard/technician"
                        element={
                            <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
                                <TechnicianLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<TechnicianDashboard />} />
                        <Route path="appointments" element={<TechnicianMyAppointments />} />
                        <Route path="tickets" element={<TechnicianServiceTickets />} />
                        <Route path="notifications" element={<TechnicianNotifications />} />
                        <Route path="certificates" element={<TechnicianCertificates /> } />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>

                    {/* CATCH-ALL "*" ROUTE (PHẢI LUÔN Ở CUỐI) */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;