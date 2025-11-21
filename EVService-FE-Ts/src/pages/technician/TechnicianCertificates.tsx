import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Award, Calendar, Building2, CheckCircle2,
    AlertCircle, Hash, Loader2, ShieldCheck
} from 'lucide-react';
import { useMyCertificates, TechnicianCertificateDto } from '@/services/technicianCertificates.ts';

export default function TechnicianCertificates() {
    const { data: certificates, isLoading } = useMyCertificates();

    // Hàm format ngày: YYYY-MM-DD -> DD/MM/YYYY
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Vô thời hạn';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Hàm kiểm tra hết hạn
    const isExpired = (expiryDate?: string) => {
        if (!expiryDate) return false; // Không có ngày hết hạn -> Không bao giờ hết hạn
        return new Date(expiryDate) < new Date();
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <Award className="w-8 h-8 text-blue-600" />
                        Chứng chỉ chuyên môn
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Quản lý các bằng cấp, chứng chỉ nghề và giấy phép hành nghề của bạn.
                    </p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center border border-blue-100">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    {certificates?.length || 0} chứng chỉ đã được xác minh
                </div>
            </div>

            <Separator />

            {/* Content Section */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
            ) : (
                <>
                    {certificates?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-slate-50">
                            <Award className="w-12 h-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Chưa có chứng chỉ nào</h3>
                            <p className="text-gray-500 max-w-sm mt-1">
                                Hồ sơ của bạn chưa cập nhật chứng chỉ nào. Vui lòng liên hệ quản trị viên để bổ sung.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {certificates?.map((cert: TechnicianCertificateDto) => {
                                const expired = isExpired(cert.expiryDate);

                                return (
                                    <Card
                                        key={cert.certificateId}
                                        className={`flex flex-col h-full transition-all duration-200 hover:shadow-md ${
                                            expired ? 'opacity-80 bg-gray-50' : 'border-blue-100 bg-white'
                                        }`}
                                    >
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="bg-blue-100 p-2 rounded-full">
                                                    <Award className="w-6 h-6 text-blue-600" />
                                                </div>
                                                {expired ? (
                                                    <Badge variant="destructive" className="flex gap-1 items-center">
                                                        <AlertCircle className="w-3 h-3" /> Hết hạn
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-green-600 hover:bg-green-700 flex gap-1 items-center">
                                                        <CheckCircle2 className="w-3 h-3" /> Có hiệu lực
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-lg font-bold pt-2 leading-tight text-gray-800">
                                                {cert.certificateName}
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent className="flex-1 space-y-4 pt-2 text-sm">
                                            {/* Tổ chức cấp */}
                                            <div className="flex items-start gap-3 text-gray-600">
                                                <Building2 className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                                                <div>
                                                    <p className="font-medium text-gray-900">Tổ chức cấp</p>
                                                    <p>{cert.issuingOrganization}</p>
                                                </div>
                                            </div>

                                            {/* Mã chứng chỉ */}
                                            {cert.credentialId && (
                                                <div className="flex items-start gap-3 text-gray-600">
                                                    <Hash className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                                                    <div className="w-full">
                                                        <p className="font-medium text-gray-900">ID Chứng chỉ</p>
                                                        <div className="bg-slate-100 px-2 py-1 rounded mt-1 font-mono text-xs text-slate-600 break-all">
                                                            {cert.credentialId}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <Separator className="my-2" />

                                            {/* Thời gian */}
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="space-y-1">
                                                    <span className="text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> Ngày cấp
                                                    </span>
                                                    <span className="font-medium text-gray-900 block">
                                                        {formatDate(cert.issueDate)}
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> Hết hạn
                                                    </span>
                                                    <span className={`font-medium block ${expired ? 'text-red-600' : 'text-gray-900'}`}>
                                                        {formatDate(cert.expiryDate)}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}