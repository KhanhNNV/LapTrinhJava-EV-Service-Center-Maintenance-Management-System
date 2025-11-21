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
// import { Label } from "@/components/ui/label"; // Không cần dùng
import { useToast } from "@/hooks/use-toast";
// import { authService } from "@/services/auth"; // Không cần dùng authService nếu không kiểm tra role
import { Loader2, Plus, Edit, Trash2, Search, Package, DollarSign, ListOrdered } from "lucide-react";
import { partService, Part, PartRequest } from "@/services/partService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/common/PaginationControls";
// Helper type guard để kiểm tra lỗi phản hồi API
// Giả định lỗi API trả về một đối tượng có response.data.message
interface ApiError {
    response?: {
        data?: {
            message?: string;
        }
    }
}

function isApiError(error: unknown): error is ApiError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as ApiError).response === 'object' &&
        (error as ApiError).response !== null &&
        'data' in (error as ApiError).response!
    );
}

// Schema cho form tạo/sửa phụ tùng
const partSchema = z.object({
    partName: z.string().min(1, "Tên phụ tùng không được để trống"),
    unitPrice: z.number().min(1, "Đơn giá phải lớn hơn 0"),
    costPrice: z.number().min(1, "Đơn giá phải lớn hơn 0"),
    // initialStock chỉ bắt buộc khi tạo mới
    initialStock: z.number().optional().nullable(),
});

type PartFormValues = z.infer<typeof partSchema>;

export default function PartsManagement() {
    const { toast } = useToast();

    // State danh sách
    const [parts, setParts] = useState<Part[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(false);

    // State cho Dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingPart, setEditingPart] = useState<Part | null>(null); // Phụ tùng đang được sửa
    const [partToDelete, setPartToDelete] = useState<number | null>(null); // ID phụ tùng đang được xóa

    // State tìm kiếm
    const [searchTerm, setSearchTerm] = useState("");

    // Form Hook
    const form = useForm<PartFormValues>({
        resolver: zodResolver(partSchema),
        defaultValues: { partName: "", unitPrice: 0, initialStock: 0 },
    });


    useEffect(() => {
        fetchParts();
    }, []);

    // --- Fetch Data ---
    const fetchParts = async () => {
        setIsLoadingList(true);
        try {
            const data = await partService.getAllParts();
            setParts(data.sort((a, b) => a.partName.localeCompare(b.partName)));
        } catch (error) {
            let errorMessage = "Không thể tải danh sách phụ tùng.";
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
    const filteredParts = useMemo(() => {
        if (!searchTerm) return parts;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return parts.filter(part =>
            part.partName.toLowerCase().includes(lowerCaseSearch) ||
            part.partId.toString().includes(lowerCaseSearch)
        );
    }, [parts, searchTerm]);

    //phân trang
    const {
        currentData, // Dữ liệu hiển thị cho trang hiện tại
        currentPage,
        totalPages,
        goToPage,
        totalItems,
        indexOfFirstItem,
        indexOfLastItem
    } = usePagination(filteredParts, 5);

    // --- Handle Dialog Actions (Không đổi) ---

    // Mở Dialog tạo mới
    const handleOpenCreate = () => {
        setEditingPart(null);
        form.reset({ partName: "", unitPrice: 0.01, initialStock: 0 });
        setIsDialogOpen(true);
    };

    // Mở Dialog sửa
    const handleOpenEdit = (part: Part) => {
        setEditingPart(part);
        form.reset({
            partName: part.partName,
            unitPrice: part.unitPrice,
            initialStock: undefined, // Bỏ qua stock khi update
        });
        setIsDialogOpen(true);
    };

    // Đóng Dialog
    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingPart(null);
        setPartToDelete(null);
    };

    // --- Submit Form (Create/Update) ---
    const onSubmit = async (values: PartFormValues) => {
        setIsSubmitting(true);
        try {
            const request: PartRequest = {
                partName: values.partName,
                unitPrice: values.unitPrice,
                costPrice: values.costPrice
            };

            let action: string;

            if (editingPart) {
                // Cập nhật (YÊU CẦU QUYỀN ADMIN TỪ BACKEND)
                await partService.updatePart(editingPart.partId, request);
                action = "cập nhật";
            } else {
                // Tạo mới (YÊU CẦU QUYỀN ADMIN TỪ BACKEND)
                request.initialStock = values.initialStock || 0;
                await partService.createPart(request);
                action = "tạo mới";
            }

            toast({
                title: "Thành công",
                description: `Đã ${action} phụ tùng thành công!`,
                className: "bg-green-600 text-white"
            });

            handleCloseDialog();
            fetchParts(); // Tải lại danh sách
        } catch (error: unknown) {
            // SỬA LỖI PREFER-CONST TẠI ĐÂY
            const defaultMsg = `Lỗi khi ${editingPart ? 'cập nhật' : 'tạo mới'} phụ tùng. (Kiểm tra quyền truy cập)`;
            let msg = defaultMsg;

            if (isApiError(error)) {
                // Lấy message từ response data nếu có
                msg = error.response?.data?.message || defaultMsg;
            } else if (error instanceof Error) {
                // Lấy message từ lỗi JS/Network nếu có
                msg = error.message;
            }

            toast({ title: "Lỗi", description: msg, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Delete Part ---
    const handleDeletePart = async () => {
        if (!partToDelete) return;

        setIsSubmitting(true);
        try {
            // Xóa (YÊU CẦU QUYỀN ADMIN TỪ BACKEND)
            await partService.deletePart(partToDelete);
            toast({
                title: "Thành công",
                description: "Đã xóa phụ tùng thành công.",
                className: "bg-green-600 text-white"
            });
            handleCloseDialog();
            fetchParts();
        } catch (error: unknown) {
            // SỬA LỖI PREFER-CONST TẠI ĐÂY
            const defaultMsg = "Lỗi khi xóa phụ tùng. (Kiểm tra quyền truy cập)";
            let msg = defaultMsg;

            if (isApiError(error)) {
                // Lấy message từ response data nếu có
                msg = error.response?.data?.message || defaultMsg;
            } else if (error instanceof Error) {
                // Lấy message từ lỗi JS/Network nếu có
                msg = error.message;
            }

            toast({ title: "Lỗi", description: msg, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Render (Không đổi) ---
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-2">
                <Package className="w-8 h-8"/> Quản Lý Phụ Tùng
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

                {/* Nút Thêm Phụ Tùng Mới (Hiển thị cho mọi user đã đăng nhập) */}
                <Button onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Thêm Phụ Tùng Mới
                </Button>
            </div>

            {/* DANH SÁCH PHỤ TÙNG */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách Phụ tùng ({filteredParts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingList ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredParts.length === 0 ? (
                        <div className="text-center py-10 border rounded-lg border-dashed">
                            <p className="text-muted-foreground">Không tìm thấy phụ tùng nào.</p>
                        </div>
                    ) : (
                        <>

                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">ID</TableHead>
                                            <TableHead>Tên Phụ Tùng</TableHead>
                                            <TableHead className="text-right">Đơn Giá</TableHead>
                                            <TableHead className="text-center w-[120px]">Hành Động</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentData.map((part) => (
                                            <TableRow key={part.partId}>
                                                <TableCell className="font-medium">{part.partId}</TableCell>
                                                <TableCell>{part.partName}</TableCell>
                                                <TableCell className="text-right font-medium text-green-600">
                                                    {part.unitPrice.toLocaleString('vi-VN')} VNĐ
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center gap-2">
                                                        {/* Nút Sửa (Hiển thị cho mọi user đã đăng nhập) */}
                                                        <Button variant="outline" size="icon" onClick={() => handleOpenEdit(part)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        {/* Nút Xóa (Hiển thị cho mọi user đã đăng nhập) */}
                                                        <Button variant="destructive" size="icon" onClick={() => setPartToDelete(part.partId)}>
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
                                        Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} trong số {totalItems} phụ tùng
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

            {/* DIALOG TẠO/SỬA PHỤ TÙNG */}
            <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <DialogHeader>
                                <DialogTitle>{editingPart ? "Cập Nhật Phụ Tùng" : "Thêm Phụ Tùng Mới"}</DialogTitle>
                                <DialogDescription>
                                    {editingPart ? `ID: ${editingPart.partId} - Điều chỉnh thông tin phụ tùng.` : "Nhập thông tin chi tiết của phụ tùng mới."}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                {/* Tên Phụ Tùng */}
                                <FormField
                                    control={form.control}
                                    name="partName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tên Phụ Tùng</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Má phanh, Lọc dầu..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Đơn Giá */}
                                <FormField
                                    control={form.control}
                                    name="unitPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1">
                                                <DollarSign className="w-4 h-4"/> Đơn Giá (VNĐ)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0.00"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                    step="0.01"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="costPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1">
                                                <DollarSign className="w-4 h-4"/> Giá nhập (VNĐ)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0.00"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                    step="0.01"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />


                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                    Hủy
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : editingPart ? (
                                        "Lưu Thay Đổi"
                                    ) : (
                                        "Tạo Phụ Tùng"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* DIALOG XÁC NHẬN XÓA */}
            <Dialog open={!!partToDelete} onOpenChange={(open) => !open && setPartToDelete(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Xác nhận Xóa Phụ Tùng</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa phụ tùng này? Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeletePart}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xóa...
                                </>
                            ) : (
                                "Xóa Phụ Tùng"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}