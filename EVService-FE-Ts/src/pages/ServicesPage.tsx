// src/pages/ServicesPage.tsx

import React from 'react';
import { Link } from 'react-router-dom'; // KHẮC PHỤC LỖI TS2304
import { LayoutDashboard, Car, Clock, Zap, LucideIcon } from 'lucide-react'; // KHẮC PHỤC CẢNH BÁO UNUSED IMPORTS

// Định nghĩa kiểu dữ liệu (Interface) cho một đối tượng Service
interface Service {
    icon: LucideIcon; // Sử dụng LucideIcon type cho icon component
    title: string;
    description: string;
    features: string[];
}

// Dữ liệu giả định cho các dịch vụ
const services: Service[] = [ // Gán kiểu cho mảng services
    {
        icon: LayoutDashboard,
        title: "Kiểm tra Tổng quát và Chẩn đoán",
        description: "Sử dụng thiết bị chẩn đoán hiện đại để kiểm tra toàn bộ hệ thống điện, pin, và phần mềm của xe.",
        features: ["Kiểm tra pin chuyên sâu", "Cập nhật phần mềm mới nhất", "Báo cáo sức khỏe xe chi tiết"]
    },
    {
        icon: Car,
        title: "Bảo dưỡng Định kỳ và Thay thế Phụ tùng",
        description: "Thực hiện bảo dưỡng định kỳ theo tiêu chuẩn nhà sản xuất, thay thế lốp, má phanh và các phụ tùng cơ khí khác.",
        features: ["Bảo dưỡng phanh tái tạo", "Kiểm tra hệ thống treo", "Thay lốp và cân bằng động"]
    },
    {
        icon: Zap,
        title: "Sửa chữa và Bảo dưỡng Hệ thống Pin",
        description: "Dịch vụ chuyên sâu về pin xe điện, bao gồm kiểm tra dung lượng, sửa chữa cell pin bị lỗi và các vấn đề về sạc.",
        features: ["Sửa chữa cell pin", "Kiểm tra hiệu suất sạc", "Bảo hành sửa chữa pin"]
    },
    {
        icon: Clock,
        title: "Dịch vụ Cứu hộ và Lắp đặt Sạc",
        description: "Cung cấp dịch vụ cứu hộ 24/7 và hỗ trợ lắp đặt trạm sạc tại nhà hoặc công ty cho khách hàng.",
        features: ["Cứu hộ khẩn cấp 24/7", "Tư vấn lắp đặt bộ sạc", "Hỗ trợ kỹ thuật từ xa"]
    },
];

// Định nghĩa kiểu Props cho ServiceCard
const ServiceCard = ({ icon: Icon, title, description, features }: Service) => (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-100">
        <Icon className="w-8 h-8 text-primary mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <ul className="space-y-2 text-sm text-gray-700">
            {/* feature đã có kiểu string, KHẮC PHỤC LỖI TS7044 */}
            {features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start">
                    <svg className="w-4 h-4 text-green-500 mr-2 mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {feature}
                </li>
            ))}
        </ul>
    </div>
);


export const ServicesPage = () => {
    return (
        <div className="pt-24 pb-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <header className="text-center mb-12">
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Dịch vụ Bảo dưỡng EV Chuyên nghiệp</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Chúng tôi cung cấp các giải pháp chăm sóc xe điện toàn diện, từ bảo dưỡng định kỳ đến sửa chữa hệ thống pin phức tạp, đảm bảo chiếc xe của bạn luôn hoạt động ở hiệu suất cao nhất.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <ServiceCard key={index} {...service} />
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Sẵn sàng trải nghiệm dịch vụ hàng đầu?</h2>
                    <p className="text-lg text-gray-600 mb-6">Đặt lịch hẹn ngay hôm nay để nhận được sự chăm sóc tận tâm từ đội ngũ chuyên gia của chúng tôi.</p>
                    <Link to="/dashboard/customer/appointments">
                        <button className="bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105">
                            Đặt lịch ngay
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};