import api from "@/services/api";

export interface ServiceTicket {
    ticketId: number;
    status: string;
    startTime: string;
    endTime?: string;
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
    inventoryId: number;     // ID bản ghi kho
    partId: number;          // ID phụ tùng (dùng để gọi API thêm/sửa)
    name: string;            // Tên phụ tùng
    price: number;           // Giá bán
    quantityInStock: number; // Số lượng đang có trong kho
}

export interface ServiceItem {
    id: number;
    itemName: string;
    price: number;
    description?: string;
}

export interface AISuggestedPart {
    partId: number;
    partName: string;
    suggestedQuantity: number;
    importanceLevel: string;
    confidenceScore: number;
    reasoning: string;
    historicalUsageCount: number;
    historicalTotalQuantity: number;
    historicalAverageQuantity: number;
    usageRate: number;
    currentUnitPrice: number;
    estimatedCost: number;
    isMandatory: boolean;
}

export interface AISuggestionResponse {
    serviceItemId: number;
    serviceItemName: string;
    serviceItemDescription: string;
    suggestions: AISuggestedPart[];
    aiReasoning?: string | null;
    totalSuggestions: number;
    overallConfidenceScore: number;
    generatedDate: string;
    analysisPeriod: string;
    totalEstimatedCost: number;
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


    getAISuggestions: async (serviceItemId: number): Promise<AISuggestionResponse> => {
        const response = await api.get(`/api/ai/suggestions/${serviceItemId}`);
        return response.data;
    },

    getAllParts: async (): Promise<Part[]> => {
        const response = await api.get("/api/inventories/my-center");

        return response.data.map((item: any) => ({
            inventoryId: item.inventoryId,
            partId: item.partId,
            name: item.partName,
            price: item.unitPrice,
            quantityInStock: item.quantity
        }));
    },

    // Hàm cập nhật/thêm phụ tùng vào phiếu (Gọi API PUT)
    updatePart: async (ticketId: number, partId: number, quantity: number) => {
        return await api.put(`/api/service-tickets/${ticketId}/parts`, {
            partId,
            quantity,
        });
    },


    // Hàm xóa dịch vụ (Delete Service Item)
    removeServiceItem: async (ticketId: number, itemId: number) => {
        return await api.delete(`/api/service-tickets/${ticketId}/service-items/${itemId}`);
    },

    // Hàm xóa phụ tùng (Delete Part)
    // Update số lượng về 0 sẽ tự động xóa
    removePart: async (ticketId: number, partId: number) => {
        return await api.put(`/api/service-tickets/${ticketId}/parts`, {
            partId: partId,
            quantity: 0
        });
    },

    completeTicket: async (ticketId: number): Promise<ServiceTicket> => {
        const response = await api.put(`/api/service-tickets/technician/${ticketId}/complete`);
        return response.data;
    },

};