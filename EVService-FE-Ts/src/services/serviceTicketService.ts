import api from "@/services/api";

export interface ServiceTicket {
    ticketId: number;
    status: string;
    startTime: string;
    endTime?: string;
    notes?: string
    serviceType: string;
    customerName: string;
    staffName?: string | null; // Có thể null
    noteCus?: string;          // Ghi chú của khách hàng
    licensePlate: string;

    items?: {
        itemId: number;
        itemName: string;
        quantity: number;
        unitPriceAtTimeOfService: number;
        lineTotal: number;
    }[];

    parts?: {
        partId: number;
        partName: string;
        quantity: number;
        unitPriceAtTimeOfService: number;
        lineTotal: number;
    }[];
}

export interface Part {
    name: string;
    price: number;
    quantity: number;
}

export interface ServiceItem {
    id: number;
    itemName: string;
    price: number;
    description?: string;
}

export const technicianTicketService = {
    // Lấy danh sách vé dịch vụ của kỹ thuật viên
    getMyTickets: async (technicianId: number | undefined): Promise<ServiceTicket[]> => {
        if (!technicianId) return [];
        const response = await api.get("/api/service-tickets/technician");
        return response.data

    },
    getAllServiceItems: async (): Promise<ServiceItem[]> => {
        const response = await api.get("/api/service-items");
        return response.data;
    },
    addServiceItem: async (ticketId: number, itemId: number) => {
        return await api.post(`/api/service-tickets/${ticketId}/service-items`, {
            itemId: itemId
        });
    },


};