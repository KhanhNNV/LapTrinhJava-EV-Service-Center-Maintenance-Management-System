import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react'; // Xóa Send
// Xóa import Button vì không còn dùng form

const contactInfo = [
    { icon: MapPin, title: "Địa chỉ Văn phòng", detail: "123 Đường Công Nghệ, Quận EV, TP.HCM" },
    { icon: Phone, title: "Đường dây nóng", detail: "+84 28 1234 5678" },
    { icon: Mail, title: "Email Hỗ trợ", detail: "support@evservice.com" },
];

export const ContactPage = () => {
    // Xóa hàm handleSubmit vì không còn dùng form

    return (
        <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4">

                {/* Header */}
                <header className="text-center mb-12">
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Liên Hệ với EV Service</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Chúng tôi luôn sẵn lòng lắng nghe ý kiến của bạn. Vui lòng liên hệ trực tiếp với chúng tôi qua thông tin dưới đây.
                    </p>
                </header>

                <div className="max-w-4xl mx-auto">

                    {/* Contact Info Section (Giữ lại và làm nó chiếm hết chiều rộng) */}
                    <div className="bg-white p-8 rounded-xl shadow-2xl border">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">Thông tin Chi tiết Liên hệ</h2>
                        <div className="space-y-8">
                            {contactInfo.map((item, index) => (
                                <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg transition-colors duration-200 hover:bg-gray-100">
                                    <item.icon className="w-8 h-8 text-primary mr-4 mt-1 shrink-0" />
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                                        <p className="text-gray-600 text-lg">{item.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Form Section đã được xóa bỏ */}
                </div>
            </div>
        </div>
    );
};