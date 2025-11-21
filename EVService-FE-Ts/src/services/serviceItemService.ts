// src/services/serviceItemService.ts

import api from "./api"; // Giả định 'api' là instance axios đã được cấu hình

// Tương đương ServiceItemDto
export interface SuggestedPart {
    partId: number;
    partName: string;
    quantity: number;
}

export interface ServiceItem {
    id: number;
    itemName: string;
    description: string;
    price: number;
    // Thêm trường này nếu ServiceItemDto của bạn trả về gợi ý
    suggestedParts: SuggestedPart[];
}

// Tương đương ServiceItemRequest
export interface ServiceItemRequest {
    itemName: string;
    description: string;
    price: number;
}

// Tương đương AddSuggestedPartRequest
export interface AddSuggestedPartRequest {
    partId: number;
    quantity: number;
}

export const serviceItemService = {
    // Lấy danh sách dịch vụ
    getAllServiceItems: async (): Promise<ServiceItem[]> => {
        const response = await api.get("/api/service-items");
        // Giả sử API trả về mảng ServiceItem, nếu không có suggestedParts thì gán mảng rỗng
        return response.data.map((item: any) => ({
            ...item,
            suggestedParts: item.suggestedParts || [],
        }));
    },

    // Tạo mới dịch vụ (ADMIN)
    createServiceItem: async (request: ServiceItemRequest): Promise<ServiceItem> => {
        const response = await api.post("/api/service-items", request);
        return response.data;
    },

    // Cập nhật dịch vụ (ADMIN)
    updateServiceItem: async (itemId: number, request: ServiceItemRequest): Promise<ServiceItem> => {
        const response = await api.put(`/api/service-items/${itemId}`, request);
        return response.data;
    },

    // Xóa dịch vụ (ADMIN)
    deleteServiceItem: async (itemId: number): Promise<void> => {
        await api.delete(`/api/service-items/${itemId}`);
    },

    // Thêm phụ tùng gợi ý (ADMIN)
    addSuggestedPart: async (itemId: number, request: AddSuggestedPartRequest): Promise<ServiceItem> => {
        const response = await api.post(`/api/service-items/${itemId}/suggest-part`, request);
        return response.data;
    },

    // Xóa phụ tùng gợi ý (ADMIN)
    removeSuggestedPart: async (itemId: number, partId: number): Promise<void> => {
        await api.delete(`/api/service-items/${itemId}/suggest-part/${partId}`);
    }
};