import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap, Menu } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/utils';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Đăng nhập</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-primary shadow-glow">
                Đăng ký
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300',
            isMenuOpen ? 'max-h-96 pb-4' : 'max-h-0'
          )}
        >
          <div className="flex flex-col gap-4 pt-4">
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
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login">
                <Button variant="ghost" className="w-full">Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button className="w-full bg-gradient-primary">Đăng ký</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
