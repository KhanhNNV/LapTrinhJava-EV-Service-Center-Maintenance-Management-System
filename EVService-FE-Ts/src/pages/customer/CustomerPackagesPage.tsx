import { useEffect, useState } from "react";
import api from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Package, CheckCircle, AlertCircle } from "lucide-react";

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
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      const payload: PurchaseRequest = { packageId };

      await api.post("/api/contracts", payload);

      toast.success("Đăng ký gói thành công!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể đăng ký gói này.");
    } finally {
      setLoading(false);
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
          <Card key={pkg.packageId} className="hover:shadow-md transition">
            <CardHeader>
              <CardTitle className="text-lg">{pkg.packageName}</CardTitle>
              <p className="text-muted-foreground text-sm">{pkg.description}</p>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Giá:</span>
                <span className="font-bold text-primary">
                  {pkg.price.toLocaleString()} đ
                </span>
              </div>

              <div className="flex justify-between">
                <span>Thời hạn:</span>
                <Badge>{pkg.duration} tháng</Badge>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Bao gồm:</p>
                <ul className="text-xs list-disc pl-4">
                  {pkg.serviceItems.slice(0, 5).map((item) => (
                    <li key={item.id}>{item.itemName}</li>
                  ))}
                  {pkg.serviceItems.length > 5 && (
                    <li className="text-muted-foreground">
                      +{pkg.serviceItems.length - 5} dịch vụ khác...
                    </li>
                  )}
                </ul>
              </div>

              <Button
                className="w-full mt-3"
                onClick={() => purchasePackage(pkg.packageId)}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Đăng ký ngay"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
