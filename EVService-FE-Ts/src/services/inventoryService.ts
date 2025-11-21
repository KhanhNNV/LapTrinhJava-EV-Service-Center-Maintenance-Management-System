import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { toast } from "sonner";

// === KIỂU DỮ LIỆU (TYPES) ===
export interface InventoryItem {
    inventoryId: number;
    partId: number;
    partName: string;
    centerId: number;
    centerName: string;
    quantity: number;
    minQuantity: number;
    unitPrice: number;
    updatedAt: string;
}

export interface ServiceCenter {
    centerId: number;
    centerName: string;
}

export interface Part {
    partId: number;
    partName: string;

}

// === API CALLS ===

// 1. Lấy danh sách tất cả Trung tâm (để Admin chọn xem kho nào)
export const useServiceCenters = () => {
    return useQuery({
        queryKey: ["service-centers"],
        queryFn: async () => {
            // Giả sử bạn đã có API này (như trong file ServiceCenterController bạn gửi)
            const res = await api.get("/api/service-centers");
            // Lưu ý: Bạn nên đổi prefix trong Controller thành /api/service-centers cho đồng bộ
            return res.data as ServiceCenter[];
        }
    });
};

// 2. Lấy danh sách tất cả Phụ tùng (để chọn khi nhập hàng)
export const useAllParts = () => {
    return useQuery({
        queryKey: ["parts"],
        queryFn: async () => {
            const res = await api.get("/api/parts");
            return res.data as Part[];
        }
    });
};

// 3. Lấy tồn kho của một Trung tâm cụ thể
export const useInventoryByCenter = (centerId: number | null) => {
    return useQuery({
        queryKey: ["inventory", centerId],
        queryFn: async () => {
            if (!centerId) return [];
            const res = await api.get(`/api/inventories/service-centers/${centerId}`);
            return res.data as InventoryItem[];
        },
        enabled: !!centerId, // Chỉ gọi khi đã chọn trung tâm
    });
};

// 4. Nhập hàng (Add Stock)
export const useAddStock = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { partId: number; centerId: number; quantityToAdd: number }) => {
            const res = await api.post("/api/inventories/add-stock", data);
            return res.data;
        },
        onSuccess: (_, variables) => {
            toast.success("Đã nhập hàng thành công!");
            // Làm mới danh sách kho của trung tâm vừa nhập
            queryClient.invalidateQueries({ queryKey: ["inventory", variables.centerId] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Lỗi khi nhập hàng");
        }
    });
};