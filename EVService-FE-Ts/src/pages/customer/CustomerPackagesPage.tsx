import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import api from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Package, CheckCircle, AlertCircle, Loader2 } from "lucide-react"; // Thêm Loader2 nếu muốn đẹp

interface ServiceItem {
    id: number;
    itemName: string;
    price: number;
}

interface ServicePackage {
    packageId: number;
    packageName: string;
    description: string;
    price: number;
    duration: number;
    serviceItems: ServiceItem[];
}

interface PurchaseRequest {
    packageId: number;
}

export default function CustomerPackagesPage() {
    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [loadingId, setLoadingId] = useState<number | null>(null); // Sửa loading để chỉ xoay ở card đang bấm
    const navigate = useNavigate(); // 2. Khởi tạo hook điều hướng

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const res = await api.get<ServicePackage[]>("/api/service-packages");
            setPackages(res.data);
        } catch {
            toast.error("Lỗi tải danh sách gói dịch vụ");
        }
    };

    const purchasePackage = async (packageId: number) => {
        try {
            setLoadingId(packageId); // Set loading cho gói cụ thể
            const payload: PurchaseRequest = { packageId };

            // Gọi API (Backend đã tự động tạo Invoice PENDING)
            const res = await api.post("/api/contracts", payload);

            toast.success("Đăng ký thành công! Đang chuyển đến trang thanh toán...", {
                duration: 3000,
            });

            // 3. CHUYỂN HƯỚNG ĐẾN TRANG HÓA ĐƠN
            setTimeout(() => {
                navigate("/dashboard/customer/payments");
            }, 1000); // Delay 1s để user kịp đọc thông báo

        } catch (err: any) {
            // Xử lý lỗi (Ví dụ: Đã mua gói rồi, Gói chưa thanh toán...)
            const message = err?.response?.data?.message || "Không thể đăng ký gói này.";
            toast.error(message);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <Package className="w-7 h-7 text-primary" />
                Gói dịch vụ hiện có
            </h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {packages.map((pkg) => (
                    <Card key={pkg.packageId} className="hover:shadow-md transition flex flex-col h-full">
                        <CardHeader>
                            <CardTitle className="text-lg">{pkg.packageName}</CardTitle>
                            <p className="text-muted-foreground text-sm min-h-[40px]">{pkg.description}</p>
                        </CardHeader>

                        <CardContent className="space-y-3 flex-1 flex flex-col">
                            <div className="flex justify-between items-center">
                                <span>Giá trọn gói:</span>
                                <span className="font-bold text-xl text-primary">
                  {pkg.price.toLocaleString('vi-VN')} đ
                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span>Hiệu lực:</span>
                                <Badge variant="secondary" className="text-sm px-3">{pkg.duration} tháng</Badge>
                            </div>

                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground font-semibold mb-1">Quyền lợi bao gồm:</p>
                                <ul className="text-xs list-disc pl-4 space-y-1 text-gray-700">
                                    {pkg.serviceItems.slice(0, 5).map((item) => (
                                        <li key={item.id}>{item.itemName}</li>
                                    ))}
                                    {pkg.serviceItems.length > 5 && (
                                        <li className="text-muted-foreground italic">
                                            Và {pkg.serviceItems.length - 5} dịch vụ khác...
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <Button
                                className="w-full mt-4 bg-primary hover:bg-primary/90"
                                onClick={() => purchasePackage(pkg.packageId)}
                                disabled={loadingId === pkg.packageId || loadingId !== null}
                            >
                                {loadingId === pkg.packageId ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...</>
                                ) : (
                                    "Đăng ký & Thanh toán"
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}