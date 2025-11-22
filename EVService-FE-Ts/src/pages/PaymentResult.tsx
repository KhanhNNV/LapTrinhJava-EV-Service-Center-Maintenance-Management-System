import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Home, RotateCcw } from "lucide-react";

export default function PaymentResult() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Lấy các tham số từ URL do VNPay trả về
    const responseCode = searchParams.get("vnp_ResponseCode");
    const transactionStatus = searchParams.get("vnp_TransactionStatus");
    const amount = searchParams.get("vnp_Amount");
    const orderInfo = searchParams.get("vnp_OrderInfo");

    // Kiểm tra trạng thái: 00 là thành công
    const isSuccess = responseCode === "00" && transactionStatus === "00";

    // Format tiền (VNPay trả về tiền nhân 100, ví dụ 1000000 = 10.000 VND)
    const formatMoney = (val: string | null) => {
        if (!val) return "0 đ";
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(Number(val) / 100);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center flex flex-col items-center">
                    {isSuccess ? (
                        <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
                    ) : (
                        <XCircle className="w-20 h-20 text-red-500 mb-4" />
                    )}
                    <CardTitle className={`text-2xl ${isSuccess ? "text-green-600" : "text-red-600"}`}>
                        {isSuccess ? "THANH TOÁN THÀNH CÔNG" : "THANH TOÁN THẤT BẠI"}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 text-sm">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Nội dung:</span>
                            <span className="font-medium text-right">{orderInfo || "Thanh toán hóa đơn"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Số tiền:</span>
                            <span className="font-bold text-lg text-blue-600">{formatMoney(amount)}</span>
                        </div>
                        {!isSuccess && (
                            <div className="flex justify-between text-red-500">
                                <span>Lỗi:</span>
                                <span>Mã lỗi {responseCode}</span>
                            </div>
                        )}
                    </div>
                    {isSuccess ? (
                        <p className="text-center text-gray-500">
                            Cảm ơn bạn đã sử dụng dịch vụ. Hóa đơn đã được cập nhật.
                        </p>
                    ) : (
                        <p className="text-center text-gray-500">
                            Giao dịch chưa hoàn tất. Vui lòng thử lại hoặc liên hệ hỗ trợ.
                        </p>
                    )}
                </CardContent>

                <CardFooter className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => window.close()}>
                        Đóng Tab
                    </Button>
                    <Button 
                        className={`flex-1 ${isSuccess ? "bg-blue-600" : "bg-red-600"}`}
                        onClick={() => navigate("dashboard/customer/payments")}
                    >
                        {isSuccess ? (
                            <><Home className="w-4 h-4 mr-2"/> Về danh sách</>
                        ) : (
                            <><RotateCcw className="w-4 h-4 mr-2"/> Thử lại</>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}