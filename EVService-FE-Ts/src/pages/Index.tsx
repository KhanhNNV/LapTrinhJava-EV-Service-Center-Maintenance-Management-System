import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { 
  Zap, 
  Calendar, 
  Shield, 
  Users, 
  Wrench, 
  TrendingUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import heroImage from '@/assets/hero-ev.jpg';

export default function Index() {
  const features = [
    {
      icon: Calendar,
      title: 'Đặt lịch dễ dàng',
      description: 'Đặt lịch bảo dưỡng trực tuyến, chọn thời gian phù hợp với bạn',
    },
    {
      icon: Shield,
      title: 'Chuyên nghiệp',
      description: 'Đội ngũ kỹ thuật viên được chứng nhận chuyên môn EV',
    },
    {
      icon: Users,
      title: 'Quản lý tập trung',
      description: 'Theo dõi lịch sử bảo dưỡng và chi phí một cách dễ dàng',
    },
    {
      icon: Wrench,
      title: 'Dịch vụ toàn diện',
      description: 'Bảo dưỡng định kỳ, sửa chữa và tư vấn chuyên sâu',
    },
    {
      icon: TrendingUp,
      title: 'Báo cáo thông minh',
      description: 'Thống kê chi tiết về tình trạng xe và chi phí',
    },
    {
      icon: Zap,
      title: 'Công nghệ hiện đại',
      description: 'Hệ thống quản lý hiện đại với AI hỗ trợ',
    },
  ];

  const services = [
    'Bảo dưỡng định kỳ',
    'Kiểm tra pin và hệ thống điện',
    'Sửa chữa và thay thế linh kiện',
    'Nâng cấp phần mềm xe',
    'Tư vấn chuyên môn',
    'Gói dịch vụ dài hạn',
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Trung tâm bảo dưỡng{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  xe điện
                </span>{' '}
                hàng đầu
              </h1>
              <p className="text-xl text-muted-foreground">
                Quản lý bảo dưỡng xe điện chuyên nghiệp với công nghệ hiện đại.
                Đặt lịch dễ dàng, theo dõi chi tiết, tiết kiệm thời gian.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-gradient-primary shadow-glow">
                    Bắt đầu ngay
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline">
                    Đăng nhập
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full"></div>
              <img
                src={heroImage}
                alt="EV Service Center"
                className="relative rounded-2xl shadow-card w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Tính năng nổi bật</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hệ thống quản lý toàn diện cho cả khách hàng và trung tâm dịch vụ
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-card hover:shadow-glow transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">Dịch vụ của chúng tôi</h2>
              <p className="text-lg text-muted-foreground">
                Chúng tôi cung cấp đầy đủ các dịch vụ bảo dưỡng và sửa chữa
                chuyên nghiệp cho xe điện của bạn.
              </p>
              <div className="space-y-3">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" />
                    <span className="text-foreground">{service}</span>
                  </div>
                ))}
              </div>
              <Link to="/dashboard/staff">
                <Button size="lg" className="bg-gradient-primary shadow-glow">
                  Đặt lịch ngay
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-primary mb-2">500+</div>
                  <p className="text-muted-foreground">Khách hàng</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-secondary mb-2">1000+</div>
                  <p className="text-muted-foreground">Dịch vụ hoàn thành</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-accent mb-2">50+</div>
                  <p className="text-muted-foreground">Kỹ thuật viên</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-primary mb-2">99%</div>
                  <p className="text-muted-foreground">Hài lòng</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Tham gia hệ thống quản lý bảo dưỡng xe điện hiện đại ngay hôm nay
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="shadow-lg">
              Đăng ký miễn phí
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-xl mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <span>EV Service</span>
              </div>
              <p className="text-muted-foreground">
                Trung tâm bảo dưỡng xe điện chuyên nghiệp
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Sản phẩm</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Tính năng</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Dịch vụ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Bảng giá</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Công ty</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Liên hệ</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Điều khoản</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Bảo mật</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
            <p>&copy; 2025 EV Service Center. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
