import { Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { Button } from '@/components/ui/button';
import { Zap, Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/utils';
// Import authService và toast
import { authService } from '@/services/auth.ts';
import { toast } from 'sonner';

// TẠO HOOK useAuth THỰC TẾ
// Hook này lấy thông tin user và cung cấp hàm logout, đồng thời chuyển hướng (navigate)
const useAuth = () => {
    // Lấy thông tin user hiện tại
    const user = authService.getCurrentUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        toast.success('Đã đăng xuất thành công');
        navigate('/login');
    };

    return { user, handleLogout };
};
// END useAuth THỰC TẾ

export const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // Sử dụng hook useAuth đã được cập nhật
    const { user, handleLogout } = useAuth();

    // Đảm bảo menu mobile đóng sau khi đăng xuất
    const handleLogoutClick = () => {
        handleLogout();
        setIsMenuOpen(false);
    }

    // --- Thành phần hiển thị khi ĐÃ ĐĂNG NHẬP (Desktop) ---
    const UserInfoDesktop = () => (
        <div className="flex items-center gap-3">
            <div className="flex flex-col text-sm text-right">
                {/* Sử dụng user.fullName và user.email từ authService */}
                <p className="font-medium truncate max-w-[150px]">{user.fullName}</p>
                <p className="truncate text-xs text-muted-foreground max-w-[150px]">{user.email}</p>
            </div>
            <Button
                variant="ghost"
                onClick={handleLogout}
                className="hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
                <LogOut className="h-4 w-4 mr-1 md:mr-0" />
                <span className="hidden lg:inline">Đăng xuất</span>
            </Button>
        </div>
    );

    // --- Thành phần hiển thị khi CHƯA ĐĂNG NHẬP (Desktop) ---
    const AuthButtonsDesktop = () => (
        <div className="flex items-center gap-3">
            <Link to="/login">
                <Button variant="ghost">Đăng nhập</Button>
            </Link>
            <Link to="/register">
                <Button className="bg-gradient-primary shadow-glow">
                    Đăng ký
                </Button>
            </Link>
        </div>
    );

    // --- Thành phần hiển thị cho MOBILE ---
    const AuthContentMobile = () => (
        <div className="flex flex-col gap-2 pt-2 border-t mt-4">
            {user ? (
                <>
                    <div className="px-1 py-2 text-sm text-muted-foreground">
                        {/* Sử dụng user.fullName và user.email từ authService */}
                        <p className="font-medium truncate">{user.fullName}</p>
                        <p className="truncate text-xs">{user.email}</p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={handleLogoutClick}
                        className="w-full justify-start hover:bg-destructive/10 hover:text-destructive"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Đăng xuất</span>
                    </Button>
                </>
            ) : (
                <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full">Đăng nhập</Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full bg-gradient-primary">Đăng ký</Button>
                    </Link>
                </>
            )}
        </div>
    );

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                        <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
                            <Zap className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              EV Service
            </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className="text-foreground hover:text-primary transition-colors">
                            Trang chủ
                        </Link>
                        <Link to="/services" className="text-foreground hover:text-primary transition-colors">
                            Dịch vụ
                        </Link>
                        <Link to="/about" className="text-foreground hover:text-primary transition-colors">
                            Về chúng tôi
                        </Link>
                        <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
                            Liên hệ
                        </Link>
                    </div>

                    {/* Desktop Auth/User Info */}
                    <div className="hidden md:flex">
                        {user ? <UserInfoDesktop /> : <AuthButtonsDesktop />}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-navigation"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                {/* Mobile Navigation */}
                <div
                    id="mobile-navigation"
                    className={cn(
                        'md:hidden overflow-hidden transition-all duration-300',
                        isMenuOpen ? 'max-h-[500px] pb-4' : 'max-h-0'
                    )}
                >
                    <div className="flex flex-col gap-4 pt-4">
                        <Link to="/" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                            Trang chủ
                        </Link>
                        <Link to="/services" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                            Dịch vụ
                        </Link>
                        <Link to="/about" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                            Về chúng tôi
                        </Link>
                        <Link to="/contact" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                            Liên hệ
                        </Link>

                        {/* Mobile Auth/User Info */}
                        <AuthContentMobile />
                    </div>
                </div>
            </div>
        </nav>
    );
};