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
    id:number
    partname: string;
    price: number;
    quantity: number;
    quantityInStock:number;
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

    updatePart: async (ticketId: number, partId: number, quantity: number) => {
        return await api.put(`/api/service-tickets/${ticketId}/parts`, {
            partId,
            quantity,
        });
    },

    getAISuggestions: async (serviceItemId: number): Promise<AISuggestionResponse> => {
        // SỬA Ở ĐÂY: Dùng template literal `${}` để đưa ID vào đường dẫn
        // Giả sử Controller của bạn có @RequestMapping("/api/ai/suggestions")
        const response = await api.get(`/api/ai/suggestions/${serviceItemId}`);
        return response.data;
    },

    getAllParts: async (): Promise<Part[]> => {
        const response = await api.get("/api/parts");
        return response.data;
    },


};