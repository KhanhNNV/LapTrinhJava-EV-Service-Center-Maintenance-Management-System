import { SidebarTrigger } from "@/components/ui/sidebar";
// 1. Import component NotificationBell
import { NotificationBell } from "@/components/NotificationBell";

interface DashboardHeaderProps {
    title: string;
}

export const DashboardHeader = ({ title }: DashboardHeaderProps) => {
    return (
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <SidebarTrigger />

            <div className="flex-1">
                <h1 className="text-xl font-semibold">{title}</h1>
            </div>

            {/* 2. Thay thế toàn bộ đoạn DropdownMenu cũ bằng dòng này */}
            <NotificationBell />

        </header>
    );
};