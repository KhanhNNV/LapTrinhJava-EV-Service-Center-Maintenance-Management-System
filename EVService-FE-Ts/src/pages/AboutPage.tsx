// src/pages/AboutPage.jsx

import { Zap, Target, Users, Award } from 'lucide-react';

const stats = [
    { value: "5+", label: "Năm Kinh nghiệm EV" },
    { value: "10K+", label: "Lượt Bảo dưỡng Thành công" },
    { value: "99%", label: "Hài lòng Khách hàng" },
];

export const AboutPage = () => {
    return (
        <div className="pt-24 pb-16 bg-white">
            <div className="container mx-auto px-4">

                {/* Header Section */}
                <header className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Về Chúng tôi: Trung tâm Dịch vụ EV Service</h1>
                    <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                        EV Service ra đời với sứ mệnh trở thành đối tác tin cậy hàng đầu trong việc bảo dưỡng và chăm sóc xe điện, mang đến công nghệ hiện đại và dịch vụ tận tâm.
                    </p>
                </header>

                {/* Mission and Vision */}
                <div className="grid md:grid-cols-2 gap-12 mb-16">
                    <div className="p-6 bg-primary/5 rounded-xl shadow-md">
                        <Target className="w-8 h-8 text-primary mb-3" />
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Sứ Mệnh</h2>
                        <p className="text-gray-700 text-lg">
                            Cung cấp các giải pháp bảo dưỡng xe điện chất lượng cao, an toàn và hiệu quả, góp phần thúc đẩy sự phát triển bền vững của phương tiện giao thông xanh tại Việt Nam. Chúng tôi cam kết minh bạch và chuyên nghiệp trong mọi dịch vụ.
                        </p>
                    </div>

                    <div className="p-6 bg-blue-500/5 rounded-xl shadow-md">
                        <Award className="w-8 h-8 text-blue-600 mb-3" />
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Tầm Nhìn</h2>
                        <p className="text-gray-700 text-lg">
                            Trở thành chuỗi trung tâm dịch vụ xe điện hàng đầu cả nước, tiên phong trong việc áp dụng công nghệ chẩn đoán và sửa chữa pin tiên tiến nhất. Nâng cao trải nghiệm sở hữu xe điện của mọi khách hàng.
                        </p>
                    </div>
                </div>

                {/* Key Stats */}
                <div className="bg-gray-100 py-12 rounded-xl mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        {stats.map((stat, index) => (
                            <div key={index}>
                                <p className="text-5xl font-extrabold text-primary mb-1">{stat.value}</p>
                                <p className="text-lg font-medium text-gray-700">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team Section (Placeholder) */}
                <div className="text-center">
                    <Users className="w-10 h-10 text-primary mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Đội ngũ Chuyên gia</h2>
                    <p className="text-gray-700 max-w-3xl mx-auto">
                        Đội ngũ kỹ thuật viên của chúng tôi được đào tạo bài bản và có chứng chỉ chuyên sâu về công nghệ xe điện, đặc biệt là hệ thống pin và điện tử. Chúng tôi luôn sẵn sàng phục vụ bạn với sự chuyên nghiệp cao nhất.
                    </p>
                </div>

            </div>
        </div>
    );
};