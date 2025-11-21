// src/services/partService.ts

import api from "./api"; // Giả định 'api' là instance axios đã được cấu hình

// Tương đương PartDto từ Spring Boot
export interface Part {
    partId: number;
    partName: string;
    unitPrice: number;
    // Thêm các trường khác (ví dụ: currentStock) nếu cần hiển thị
    currentStock: number;
    // Giả định backend trả về costPrice trong PartDto (thường chỉ ADMIN mới thấy)
    costPrice: number;
}

// Tương đương PartRequest mới từ Spring Boot
export interface PartRequest {
    partName: string;
    unitPrice: number;
    // THÊM: costPrice là bắt buộc khi tạo/sửa
    costPrice: number;
    // Trường này chỉ dùng khi tạo mới, không dùng khi cập nhật
    initialStock?: number;
}

export const partService = {
    // Lấy danh sách phụ tùng
    getAllParts: async (): Promise<Part[]> => {
        const response = await api.get("/api/parts");
        return response.data;
    },

    // Lấy chi tiết phụ tùng theo ID
    getPartById: async (partId: number): Promise<Part> => {
        const response = await api.get(`/api/parts/${partId}`);
        return response.data;
    },

    // Tạo mới phụ tùng
    createPart: async (request: PartRequest): Promise<Part> => {
        const response = await api.post("/api/parts", request);
        return response.data;
    },

    // Cập nhật thông tin phụ tùng (ADMIN)
    updatePart: async (partId: number, request: PartRequest): Promise<Part> => {
        // unitPrice, partName VÀ costPrice
        const response = await api.put(`/api/parts/${partId}`, request);
        return response.data;
    },

    // Xóa phụ tùng (ADMIN)
    deletePart: async (partId: number): Promise<void> => {
        await api.delete(`/api/parts/${partId}`);
    },
};