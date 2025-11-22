import { useEffect, useState } from "react";
import api from "@/services/api";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CalendarDays, XCircle, ClipboardList } from "lucide-react";

interface MyContract {
  contractId: number;
  packageId: number;
  packageName: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function MyContractsPage() {
  const [contracts, setContracts] = useState<MyContract[]>([]);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const res = await api.get<MyContract[]>("/api/contracts");
      setContracts(res.data);
    } catch {
      toast.error("Không thể tải danh sách hợp đồng");
    }
  };

  const cancelContract = async (id: number) => {
    try {
      await api.put(`/api/contracts/${id}/cancel`);
      toast.success("Đã hủy hợp đồng");
      fetchContracts();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Không thể hủy hợp đồng này."
      );
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <ClipboardList className="w-7 h-7 text-primary" />
        Hợp đồng của tôi
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contracts.map((c) => (
          <Card key={c.contractId} className="hover:shadow">
            <CardHeader>
              <CardTitle>{c.packageName}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Bắt đầu:</span>
                <span>{c.startDate}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Kết thúc:</span>
                <span>{c.endDate}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Trạng thái:</span>
                <Badge
                  className={
                    c.status === "ACTIVE"
                      ? "bg-green-500"
                      : c.status === "CANCELLED"
                      ? "bg-red-500"
                      : "bg-gray-500"
                  }
                >
                  {c.status}
                </Badge>
              </div>

              {c.status === "ACTIVE" && (
                <Button
                  className="w-full mt-3"
                  variant="destructive"
                  onClick={() => cancelContract(c.contractId)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Hủy hợp đồng
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
