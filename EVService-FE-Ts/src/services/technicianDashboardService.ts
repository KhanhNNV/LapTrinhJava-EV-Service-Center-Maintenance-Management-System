import api from "@/services/api";

export interface DashboardStats {
    assignedAppointments: number;
    inProgressTickets: number;
    completedToday: number;
    completedInMonth: number;
}

export const technicianDashboardService = {

    getStats: async (technicianId: number, selectedDate: Date): Promise<DashboardStats> => {
        try {
            const [appointmentsRes, ticketsRes] = await Promise.all([
                api.get("/api/appointments/technician"),
                api.get("/api/service-tickets/technician"),
            ]);

            const myAppointments = appointmentsRes.data.filter(
                (a: any) => a.technicianId === technicianId
            );

            const myTickets = ticketsRes.data.filter(
                (t: any) => t.technicianId === technicianId || t.appointment?.technicianId === technicianId
            );

            const assignedAppointments = myAppointments.filter(
                (a: any) => a.status === "ASSIGNED"
            ).length;

            const inProgressTickets = myTickets.filter(
                (t: any) => t.status === "IN_PROGRESS"
            ).length;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const completedToday = myTickets.filter((t: any) => {
                if (t.status !== "COMPLETED" || !t.endTime) return false;
                const ticketDate = new Date(t.endTime);
                ticketDate.setHours(0, 0, 0, 0);
                return ticketDate.getTime() === today.getTime();
            }).length;

            const targetMonth = selectedDate.getMonth();
            const targetYear = selectedDate.getFullYear();

            const completedInMonth = myTickets.filter((t: any) => {
                if (t.status !== "COMPLETED" || !t.endTime) return false;
                const ticketDate = new Date(t.endTime);
                return (
                    ticketDate.getMonth() === targetMonth &&
                    ticketDate.getFullYear() === targetYear
                );
            }).length;

            return {
                assignedAppointments,
                inProgressTickets,
                completedToday,
                completedInMonth,
            };

        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            throw error;
        }
    }
};