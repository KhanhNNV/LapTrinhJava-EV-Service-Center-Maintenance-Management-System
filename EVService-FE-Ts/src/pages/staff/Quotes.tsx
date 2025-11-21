import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/services/api";
import { toast } from "sonner";
import {
  Search,
  Package,
  Wrench,
  ShoppingCart,
  Plus,
  Trash2,
  Printer,
  FileCheck,
  X,
} from "lucide-react";

// --- 1. CẬP NHẬT INTERFACES KHỚP VỚI JAVA DTO ---

interface ServiceItem {
  // Kiểm tra lại ServiceItemDto bên Java xem là itemId hay id
  // Giả sử Java trả về: itemId, itemName, price...
  itemId?: number;
  id?: number; // Fallback
  itemName?: string;
  name?: string; // Fallback
  description: string;
  price: number;
}

interface ServicePackage {
  packageId: number; // Sửa từ id -> packageId
  packageName: string; // Sửa từ name -> packageName
  description: string;
  price: number; // Sửa từ totalPrice -> price
  duration: number; // Sửa từ durationInMonths -> duration
  serviceItems: ServiceItem[]; // Đảm bảo Java trả về list này
}

interface Part {
  partId: number;
  partName: string;
  partNumber: string;
  unitPrice: number;
  stockQuantity: number;
  manufacturer: string;
}

interface QuoteItem {
  uniqueId: string;
  id: number;
  type: "SERVICE" | "PACKAGE" | "PART";
  name: string;
  price: number;
  quantity: number;
}

// === HÀM FORMAT TIỀN SIÊU AN TOÀN – CHỐNG UNDEFINED MÃI MÃI ===
const formatPrice = (
  price: number | null | undefined,
  fallback = "0.00"
): string => {
  if (price == null || isNaN(price)) return fallback;
  return Number(price).toFixed(2);
};

// Nếu anh dùng tiền Việt Nam thì đẹp hơn thế này:
const formatVND = (price: number | null | undefined): string => {
  if (price == null || isNaN(price) || price <= 0) {
    return "Liên hệ";
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(price);
};

export default function StaffQuotes() {
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);
  const [parts, setParts] = useState<Part[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, packagesRes, partsRes] = await Promise.all([
        api.get("/api/service-items"),
        api.get("/api/service-packages"),
        api.get("/api/parts"),
      ]);

      setServiceItems(servicesRes.data);
      setServicePackages(packagesRes.data);
      setParts(partsRes.data);
    } catch (error) {
      toast.error("Không thể tải dữ liệu. Vui lòng kiểm tra lại Backend.");
      console.error(error);
    }
  };

  // --- QUOTE LOGIC ---
  const addToQuote = (item: any, type: "SERVICE" | "PACKAGE" | "PART") => {
    // Chuẩn hóa dữ liệu vì tên trường khác nhau giữa các loại
    const id = type === "PACKAGE" ? item.packageId : item.itemId || item.id;
    const name =
      type === "PACKAGE" ? item.packageName : item.itemName || item.name;
    const price = item.price; // ServicePackageDto và ServiceItemDto đều dùng 'price'

    const existingItemIndex = quoteItems.findIndex(
      (i) => i.id === id && i.type === type
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...quoteItems];
      updatedItems[existingItemIndex].quantity += 1;
      setQuoteItems(updatedItems);
    } else {
      const newItem: QuoteItem = {
        uniqueId: `${type}-${id}-${Date.now()}`,
        id: id,
        type,
        name: name,
        price: price,
        quantity: 1,
      };
      setQuoteItems([...quoteItems, newItem]);
    }
    toast.success(`Đã thêm "${name}" vào báo giá`);
  };

  const removeFromQuote = (index: number) => {
    const newItems = [...quoteItems];
    newItems.splice(index, 1);
    setQuoteItems(newItems);
  };

  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...quoteItems];
    const item = newItems[index];
    const newQuantity = item.quantity + delta;

    if (newQuantity > 0) {
      item.quantity = newQuantity;
      setQuoteItems(newItems);
    }
  };

  const calculateTotal = () => {
    return quoteItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // --- FILTERING ---
  // Cập nhật logic filter theo tên trường mới
  // const filteredServiceItems = serviceItems.filter(
  //   (item) =>
  //     (item.itemName || item.name || "")
  //       .toLowerCase()
  //       .includes(searchTerm.toLowerCase()) ||
  //     (item.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  // );

  // const filteredPackages = servicePackages.filter(
  //   (pkg) =>
  //     (pkg.packageName || "")
  //       .toLowerCase()
  //       .includes(searchTerm.toLowerCase()) ||
  //     (pkg.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  // );

  // const filteredParts = parts.filter(
  //   (part) =>
  //     part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     part.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
  // );
  // === HÀM FILTER SIÊU AN TOÀN – DÙNG CHO MỌI DTO ===
  const searchIn = (text: any, term: string): boolean => {
    if (!term) return true;
    if (text == null) return false;
    return String(text).toLowerCase().includes(term.toLowerCase());
  };

  // Dùng lại cho tất cả
  const lowerTerm = searchTerm.toLowerCase().trim();

  const filteredServiceItems = serviceItems.filter(
    (item) =>
      searchIn(item.itemName || item.name, searchTerm) ||
      searchIn(item.description, searchTerm)
  );

  const filteredPackages = servicePackages.filter(
    (pkg) =>
      searchIn(pkg.packageName || pkg.packageName, searchTerm) ||
      searchIn(pkg.description, searchTerm)
  );

  const filteredParts = parts.filter(
    (part) =>
      searchIn(part.partId, searchTerm) ||
      searchIn(part.partNumber, searchTerm) ||
      searchIn(part.manufacturer, searchTerm)
  );

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tạo Báo Giá</h2>
        <p className="text-muted-foreground">
          Tra cứu dịch vụ, gói bảo dưỡng và linh kiện để báo giá cho khách hàng
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 flex flex-col space-y-4 overflow-hidden">
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs
            defaultValue="services"
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="w-full justify-start">
              <TabsTrigger value="services" className="flex-1">
                <Wrench className="h-4 w-4 mr-2" /> Dịch Vụ Lẻ
              </TabsTrigger>
              <TabsTrigger value="packages" className="flex-1">
                <Package className="h-4 w-4 mr-2" /> Gói Bảo Dưỡng
              </TabsTrigger>
              <TabsTrigger value="parts" className="flex-1">
                <ShoppingCart className="h-4 w-4 mr-2" /> Linh Kiện
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4 pr-2 pb-20">
              {/* SERVICES TAB */}
              <TabsContent value="services" className="m-0">
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredServiceItems.map((item) => (
                    <Card
                      key={item.itemId || item.id}
                      className="flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            {item.itemName || item.name}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-2 border-t flex justify-between items-center">
                        <span className="text-lg font-bold text-primary">
                          {formatVND(item.price)}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => addToQuote(item, "SERVICE")}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Thêm
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* PACKAGES TAB - Đã sửa trường dữ liệu */}
              <TabsContent value="packages" className="m-0">
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredPackages.map((pkg) => (
                    <Card
                      key={pkg.packageId}
                      className="flex flex-col justify-between hover:shadow-md transition-shadow border-blue-100 bg-blue-50/20"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          {/* Sửa: pkg.packageName */}
                          <CardTitle className="text-lg">
                            {pkg.packageName}
                          </CardTitle>
                          {/* Sửa: pkg.duration */}
                          <Badge className="bg-blue-500">
                            {pkg.duration} tháng
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 pb-2">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {pkg.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {/* Sửa: Kiểm tra serviceItems có tồn tại không trước khi map */}
                          {pkg.serviceItems &&
                            pkg.serviceItems.slice(0, 3).map((s: any) => (
                              <Badge
                                key={s.itemId || s.id}
                                variant="outline"
                                className="text-[10px] bg-white"
                              >
                                {s.itemName || s.name}
                              </Badge>
                            ))}
                          {pkg.serviceItems && pkg.serviceItems.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-white"
                            >
                              +{pkg.serviceItems.length - 3}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 border-t flex justify-between items-center">
                        {/* Sửa: pkg.price */}
                        <span className="text-xl font-bold text-blue-600">
                          {formatVND(pkg.price)}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => addToQuote(pkg, "PACKAGE")}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Thêm Gói
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* PARTS TAB */}
              <TabsContent value="parts" className="m-0">
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredParts.map((part) => (
                    <Card
                      key={part.partId}
                      className="flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">
                          {part.partName}
                        </CardTitle>
                        <div className="text-xs text-muted-foreground">
                          PN: {part.partNumber}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Hãng:</span>
                          <span>{part.manufacturer}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Tồn kho:
                          </span>
                          <span
                            className={
                              part.stockQuantity > 0
                                ? "text-green-600 font-medium"
                                : "text-red-500 font-medium"
                            }
                          >
                            {part.stockQuantity}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 border-t flex justify-between items-center">
                        <span className="text-lg font-bold text-primary">
                          {formatVND(part.unitPrice)}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => addToQuote(part, "PART")}
                          disabled={part.stockQuantity <= 0}
                          variant={
                            part.stockQuantity <= 0 ? "secondary" : "default"
                          }
                        >
                          {part.stockQuantity <= 0 ? "Hết hàng" : "Thêm"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* RIGHT COLUMN: QUOTE BUILDER (Không thay đổi logic, chỉ hiển thị lại) */}
        <div className="lg:col-span-1 h-full flex flex-col">
          <Card className="h-full flex flex-col shadow-lg border-t-4 border-t-primary">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                Phiếu Báo Giá
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {quoteItems.length} hạng mục đã chọn
              </p>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden">
              {quoteItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                  <ShoppingCart className="h-12 w-12 mb-3 opacity-20" />
                  <p>Chưa có mục nào.</p>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-3">
                    {quoteItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col bg-card border rounded-lg p-3 shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              {item.type === "SERVICE"
                                ? "Dịch vụ"
                                : item.type === "PACKAGE"
                                ? "Gói"
                                : "Linh kiện"}
                            </span>
                            <h4 className="font-medium text-sm">{item.name}</h4>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive -mr-2 -mt-2"
                            onClick={() => removeFromQuote(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center border rounded-md">
                            <button
                              className="px-2 py-0.5 hover:bg-muted rounded-l-md"
                              onClick={() => updateQuantity(index, -1)}
                            >
                              -
                            </button>
                            <span className="px-2 text-sm font-medium min-w-[24px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              className="px-2 py-0.5 hover:bg-muted rounded-r-md"
                              onClick={() => updateQuantity(index, 1)}
                            >
                              +
                            </button>
                          </div>
                          <div className="font-bold">
                            {formatVND(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>

            <div className="p-4 bg-muted/20 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium text-muted-foreground">
                  Tổng cộng:
                </span>
                <span className="text-2xl font-bold text-primary">
                  {formatVND(calculateTotal())}
                </span>
              </div>
              <Button
                className="w-full bg-gradient-primary shadow-glow"
                disabled={quoteItems.length === 0}
              >
                <Printer className="h-4 w-4 mr-2" />
                Xuất Phiếu
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
