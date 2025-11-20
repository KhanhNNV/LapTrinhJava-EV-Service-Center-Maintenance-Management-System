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
import Notifications from "./pages/customer/Notifications";
import CustomerChat from "./pages/customer/CustomerChat";
import StaffDashboard from "./pages/staff/Dashboard";
import StaffAppointments from "./pages/staff/Appointments";
import StaffCustomers from "./pages/staff/Customers";
import StaffServiceTickets from "./pages/staff/ServiceTickets";
import StaffMessages from "./pages/staff/Messages";
import StaffNotifications from "./pages/staff/Notifications";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminServiceCenters from "./pages/admin/ServiceCenters";
import AdminPartsInventory from "./pages/admin/PartsInventory";
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
            path="/auth/email-sent"
            element={<EmailVerificationSentPage />}
          />
          <Route
            path="/auth/forgot-password"
            element={<ForgotPasswordPage />}
          />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

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
            <Route path="tickets" element={<StaffServiceTickets />} />
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
            <Route path="parts" element={<AdminPartsInventory />} />
            <Route path="packages" element={<AdminServicePackages />} />
            <Route path="analytics" element={<AdminAnalytics />} />
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
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
