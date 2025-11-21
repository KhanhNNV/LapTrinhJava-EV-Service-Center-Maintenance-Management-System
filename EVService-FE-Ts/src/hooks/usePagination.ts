import { useState, useEffect } from "react";

export function usePagination<T>(data: T[], itemsPerPage: number = 10) {
    const [currentPage, setCurrentPage] = useState(1);

    // Tính toán tổng số trang
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Reset về trang 1 nếu dữ liệu đầu vào thay đổi (ví dụ: khi user lọc danh sách)
    useEffect(() => {
        setCurrentPage(1);
    }, [data.length, JSON.stringify(data)]);
    // JSON.stringify giúp so sánh sâu nếu mảng thay đổi nội dung,
    // nhưng nếu data lớn chỉ cần data.length hoặc dependency bên ngoài là đủ.

    // Các chỉ số để cắt mảng
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // Dữ liệu hiện tại (đã cắt)
    const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

    // Hàm chuyển trang
    const goToPage = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const nextPage = () => goToPage(currentPage + 1);
    const prevPage = () => goToPage(currentPage - 1);

    return {
        currentData,      // Dữ liệu của trang hiện tại (để map ra UI)
        currentPage,      // Trang hiện tại
        totalPages,       // Tổng số trang
        totalItems,       // Tổng số phần tử
        indexOfFirstItem, // Chỉ số bắt đầu (dùng để hiển thị "Từ 1-10...")
        indexOfLastItem,  // Chỉ số kết thúc
        goToPage,         // Hàm nhảy trang
        nextPage,         // Hàm trang sau
        prevPage,         // Hàm trang trước
    };
}