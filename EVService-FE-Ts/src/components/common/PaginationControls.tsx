import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export function PaginationControls({
                                       currentPage,
                                       totalPages,
                                       onPageChange,
                                       className = ""
                                   }: PaginationControlsProps) {
    if (totalPages <= 1) return null; // Ẩn nếu chỉ có 1 trang

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Button
                variant="outline" size="icon"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
            >
                <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
                variant="outline" size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm font-medium min-w-[3rem] text-center">
                Trang {currentPage} / {totalPages}
            </span>

            <Button
                variant="outline" size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
                variant="outline" size="icon"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
            >
                <ChevronsRight className="h-4 w-4" />
            </Button>
        </div>
    );
}