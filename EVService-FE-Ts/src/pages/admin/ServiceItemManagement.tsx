import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, Search, Wrench, DollarSign } from "lucide-react";
import { serviceItemService, ServiceItem, ServiceItemRequest } from "@/services/serviceItemService";
// ĐÃ LOẠI BỎ: import { SuggestedPart, AddSuggestedPartRequest } from ...
// ĐÃ LOẠI BỎ: import { partService, Part } from "@/services/partService";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/common/PaginationControls";

// Helper type guard để kiểm tra lỗi phản hồi API
interface ApiError {
    response?: {
        data?: {
            message?: string;
        }
    }
}
function isApiError(error: unknown): error is ApiError {
    return (
        typeof error === 'object' && error !== null && 'response' in error
    );
}

// --- Schemas ---

// Schema cho form tạo/sửa dịch vụ (Không thay đổi)
const serviceItemSchema = z.object({
    itemName: z.string().min(1, "Tên dịch vụ không được để trống"),
    description: z.string().min(1, "Mô tả không được để trống"),
    price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
});
type ServiceItemFormValues = z.infer<typeof serviceItemSchema>;

// ĐÃ LOẠI BỎ: suggestedPartSchema và SuggestedPartFormValues


export default function ServiceItemManagement() {
    const { toast } = useToast();

    // --- State Danh sách và Loading ---
    const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
    // ĐÃ LOẠI BỎ: const [allParts, setAllParts] = useState<Part[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // --- State Dialog CRUD ---
    const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    // --- State Dialog Gợi ý (ĐÃ LOẠI BỎ) ---
    // const [isSuggestionDialogOpen, setIsSuggestionDialogOpen] = useState(false);
    // const [selectedItemForSuggestion, setSelectedItemForSuggestion] = useState<ServiceItem | null>(null);

    // Form Hook CRUD
    const itemForm = useForm<ServiceItemFormValues>({
        resolver: zodResolver(serviceItemSchema),
        defaultValues: { itemName: "", description: "", price: 0 },
    });

    // ĐÃ LOẠI BỎ: Form Hook Gợi ý Phụ tùng

    useEffect(() => {
        fetchData();
    }, []);

    // --- Fetch Data ---
    const fetchData = async () => {
        setIsLoadingList(true);
        try {
            // CHỈ fetch Service Items
            const itemsData = await serviceItemService.getAllServiceItems();
            setServiceItems(itemsData.sort((a, b) => a.itemName.localeCompare(b.itemName)));

            // ĐÃ LOẠI BỎ: fetch partsData
            // ĐÃ LOẠI BỎ: setAllParts(partsData);
        } catch (error) {
            let errorMessage = "Không thể tải dữ liệu dịch vụ.";
            if (isApiError(error)) {
                errorMessage = error.response?.data?.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast({ title: "Lỗi", description: errorMessage, variant: "destructive" });
        } finally {
            setIsLoadingList(false);
        }
    };

    // --- Filtering (Không đổi) ---
    const filteredItems = useMemo(() => {
        if (!searchTerm) return serviceItems;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return serviceItems.filter(item =>
            item.itemName.toLowerCase().includes(lowerCaseSearch) ||
            item.id.toString().includes(lowerCaseSearch)
        );
    }, [serviceItems, searchTerm]);

    const {
        currentData, // Dữ liệu hiển thị cho trang hiện tại
        currentPage,
        totalPages,
        goToPage,
        totalItems,
        indexOfFirstItem,
        indexOfLastItem
    } = usePagination(filteredItems, 5);

    // --- CRUD Handlers (Không đổi) ---

    const handleOpenCreate = () => {
        setEditingItem(null);
        itemForm.reset({ itemName: "", description: "", price: 0 });
        setIsItemDialogOpen(true);
    };

    const handleOpenEdit = (item: ServiceItem) => {
        setEditingItem(item);
        itemForm.reset({
            itemName: item.itemName,
            description: item.description,
            price: item.price,
        });
        setIsItemDialogOpen(true);
    };

    const handleCloseItemDialog = () => {
        setIsItemDialogOpen(false);
        setEditingItem(null);
        setItemToDelete(null);
    };

    const onFormSubmit = async (values: ServiceItemFormValues) => {
        setIsSubmitting(true);
        try {
            const request: ServiceItemRequest = {
                itemName: values.itemName,
                description: values.description,
                price: values.price,
            };

            let action: string;

            if (editingItem) {
                await serviceItemService.updateServiceItem(editingItem.id, request);
                action = "cập nhật";
            } else {
                await serviceItemService.createServiceItem(request);
                action = "tạo mới";
            }

            toast({
                title: "Thành công",
                description: `Đã ${action} dịch vụ thành công!`,
                className: "bg-green-600 text-white"
            });

            handleCloseItemDialog();
            fetchData();
        } catch (error: unknown) {
            const defaultMsg = `Lỗi khi ${editingItem ? 'cập nhật' : 'tạo mới'} dịch vụ. (Kiểm tra quyền ADMIN)`;
            let msg = defaultMsg;

            if (isApiError(error)) {
                msg = (error.response?.data?.message || defaultMsg);
            }

            toast({ title: "Lỗi", description: msg, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteItem = async () => {
        if (!itemToDelete) return;

        setIsSubmitting(true);
        try {
            await serviceItemService.deleteServiceItem(itemToDelete);
            toast({
                title: "Thành công",
                description: "Đã xóa dịch vụ thành công.",
                className: "bg-green-600 text-white"
            });
            handleCloseItemDialog();
            fetchData();
        } catch (error: unknown) {
            const defaultMsg = "Lỗi khi xóa dịch vụ. (Kiểm tra quyền ADMIN)";
            let msg = defaultMsg;
            if (isApiError(error)) {
                msg = (error.response?.data?.message || defaultMsg);
            }
            toast({ title: "Lỗi", description: msg, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Suggestion Handlers (ĐÃ LOẠI BỎ) ---
    // Loại bỏ toàn bộ các hàm: handleOpenSuggestionDialog, handleCloseSuggestionDialog, handleAddSuggestedPart, handleRemoveSuggestedPart


    // --- Render ---
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-2">
                <Wrench className="w-8 h-8"/> Quản Lý Dịch Vụ
            </h2>
            <hr />

            <div className="flex justify-between items-center gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo tên hoặc ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>

                <Button onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Thêm Dịch Vụ Mới
                </Button>
            </div>

            {/* DANH SÁCH DỊCH VỤ */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách Dịch vụ ({filteredItems.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingList ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-10 border rounded-lg border-dashed">
                            <p className="text-muted-foreground">Không tìm thấy dịch vụ nào.</p>
                        </div>
                    ) : (
                        <>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">ID</TableHead>
                                        <TableHead>Tên Dịch Vụ</TableHead>
                                        <TableHead className="w-[40%]">Mô Tả</TableHead>
                                        <TableHead className="text-right">Giá</TableHead>
                                        {/* ĐÃ LOẠI BỎ: Cột Gợi Ý */}
                                        <TableHead className="text-center w-[120px]">Hành Động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentData.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.id}</TableCell>
                                            <TableCell>{item.itemName}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-sm truncate">
                                                {item.description}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-blue-600">
                                                {item.price.toLocaleString('vi-VN')} VNĐ
                                            </TableCell>
                                            {/* ĐÃ LOẠI BỎ: Badge/Nút Gợi Ý */}
                                            <TableCell className="text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Button variant="outline" size="icon" onClick={() => handleOpenEdit(item)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="destructive" size="icon" onClick={() => setItemToDelete(item.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                            {totalItems > 0 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between border-t pt-4 mt-4 gap-4">
                                    <div className="text-sm text-muted-foreground">
                                        Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} trong số {totalItems} dịch vụ
                                    </div>

                                    <PaginationControls
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={goToPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* DIALOG TẠO/SỬA DỊCH VỤ (CRUD) - Giữ nguyên */}
            <Dialog open={isItemDialogOpen} onOpenChange={handleCloseItemDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <Form {...itemForm}>
                        <form onSubmit={itemForm.handleSubmit(onFormSubmit)}>
                            <DialogHeader>
                                <DialogTitle>{editingItem ? "Cập Nhật Dịch Vụ" : "Thêm Dịch Vụ Mới"}</DialogTitle>
                                <DialogDescription>
                                    {editingItem ? `ID: ${editingItem.id} - Điều chỉnh thông tin dịch vụ.` : "Nhập thông tin chi tiết của dịch vụ mới."}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                {/* Tên Dịch Vụ */}
                                <FormField
                                    control={itemForm.control}
                                    name="itemName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tên Dịch Vụ</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Thay dầu, Bảo dưỡng A..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Mô Tả */}
                                <FormField
                                    control={itemForm.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mô Tả Chi Tiết</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Chi tiết công việc..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Giá */}
                                <FormField
                                    control={itemForm.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1">
                                                <DollarSign className="w-4 h-4"/> Giá (VNĐ)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                    min="0"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleCloseItemDialog}>
                                    Hủy
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : editingItem ? (
                                        "Lưu Thay Đổi"
                                    ) : (
                                        "Tạo Dịch Vụ"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* DIALOG XÁC NHẬN XÓA - Giữ nguyên */}
            <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Xác nhận Xóa Dịch Vụ</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa dịch vụ này? Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCloseItemDialog} disabled={isSubmitting}>
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteItem}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xóa...
                                </>
                            ) : (
                                "Xóa Dịch Vụ"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ĐÃ LOẠI BỎ: DIALOG QUẢN LÝ GỢI Ý PHỤ TÙNG */}
        </div>
    );
}