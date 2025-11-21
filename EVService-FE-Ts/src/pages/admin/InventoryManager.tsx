import { useState } from "react";
import { useServiceCenters, useInventoryByCenter, useAllParts, useAddStock } from "@/services/inventoryService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, PlusCircle, Store } from "lucide-react";

export default function InventoryManager() {
    // 1. Chọn trung tâm để xem
    const { data: centers } = useServiceCenters();
    const [selectedCenterId, setSelectedCenterId] = useState<string>(""); // Lưu ID dưới dạng string cho Select

    // 2. Lấy dữ liệu kho
    const centerIdNumber = selectedCenterId ? parseInt(selectedCenterId) : null;
    const { data: inventories, isLoading } = useInventoryByCenter(centerIdNumber);

    // 3. Dữ liệu cho form nhập hàng
    const { data: parts } = useAllParts();
    const addStockMutation = useAddStock();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        partId: "",
        quantity: ""
    });

    // Xử lý nhập hàng
    const handleAddStock = () => {
        if (!selectedCenterId || !formData.partId || !formData.quantity) return;

        addStockMutation.mutate({
            centerId: parseInt(selectedCenterId),
            partId: parseInt(formData.partId),
            quantityToAdd: parseInt(formData.quantity)
        }, {
            onSuccess: () => {
                setIsDialogOpen(false);
                setFormData({ partId: "", quantity: "" });
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Quản lý Kho hàng</h2>
                    <p className="text-muted-foreground">Theo dõi và nhập hàng cho từng chi nhánh</p>
                </div>

                {/* Nút Nhập hàng (Chỉ hiện khi đã chọn trung tâm) */}
                {selectedCenterId && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary shadow-glow">
                                <PlusCircle className="w-4 h-4 mr-2" /> Nhập hàng
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Nhập hàng vào kho</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Chọn phụ tùng</Label>
                                    <Select onValueChange={(v) => setFormData({...formData, partId: v})}>
                                        <SelectTrigger><SelectValue placeholder="Chọn phụ tùng..." /></SelectTrigger>
                                        <SelectContent>
                                            {parts?.map((p) => (
                                                <SelectItem key={p.partId} value={p.partId.toString()}>
                                                    {p.partName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Số lượng nhập thêm</Label>
                                    <Input
                                        type="number" min="1" placeholder="VD: 50"
                                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddStock} disabled={addStockMutation.isPending}>
                                    {addStockMutation.isPending ? "Đang xử lý..." : "Xác nhận nhập"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Bộ chọn Trung tâm */}
            <Card className="p-4 bg-muted/20">
                <div className="flex items-center gap-4">
                    <Store className="w-5 h-5 text-muted-foreground" />
                    <Label className="whitespace-nowrap">Đang xem kho tại:</Label>
                    <Select value={selectedCenterId} onValueChange={setSelectedCenterId}>
                        <SelectTrigger className="w-[300px] bg-background">
                            <SelectValue placeholder="Chọn trung tâm dịch vụ..." />
                        </SelectTrigger>
                        <SelectContent>
                            {centers?.map((c) => (
                                <SelectItem key={c.centerId} value={c.centerId.toString()}>
                                    {c.centerName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Bảng dữ liệu */}
            {selectedCenterId ? (
                <Card className="shadow-card">
                    <CardHeader><CardTitle>Danh sách tồn kho</CardTitle></CardHeader>
                    <CardContent>
                        {isLoading ? <div>Đang tải...</div> : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Tên phụ tùng</TableHead>
                                        <TableHead>Số lượng thực tế</TableHead>
                                        <TableHead>Mức tối thiểu</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inventories?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                                                Kho này chưa có dữ liệu. Hãy nhập hàng!
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {inventories?.map((item) => {
                                        const isLow = item.quantity <= item.minQuantity;
                                        return (
                                            <TableRow key={item.inventoryId} className={isLow ? "bg-red-50" : ""}>
                                                <TableCell>#{item.inventoryId}</TableCell>
                                                <TableCell className="font-medium">{item.partName}</TableCell>
                                                <TableCell className="font-bold text-lg">{item.quantity}</TableCell>
                                                <TableCell className="text-muted-foreground">{item.minQuantity}</TableCell>
                                                <TableCell>
                                                    {isLow ? (
                                                        <Badge variant="destructive" className="gap-1">
                                                            <AlertTriangle className="w-3 h-3" /> Sắp hết hàng
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 gap-1">
                                                            <Package className="w-3 h-3" /> Ổn định
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Store className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Vui lòng chọn một trung tâm dịch vụ ở trên để xem kho</p>
                </div>
            )}
        </div>
    );
}