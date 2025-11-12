package edu.uth.evservice.repositories;

import edu.uth.evservice.models.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface IVehicleRepository extends JpaRepository<Vehicle, Integer> {
    List<Vehicle> findByServiceCenter_CenterId(Integer centerId);
    Vehicle findByLicensePlate(String licensePlate);
    List<Vehicle> findByUser_UserId(Integer userId);
    // Công dụng: Kiểm tra nhanh sự tồn tại của một biển số trong bảng 'vehicles'.
    boolean existsByLicensePlate(String licensePlate);
    // Công dụng: Dùng cho API "Lấy danh sách xe của tôi".
    List<Vehicle> findByUser_Username(String username);
    // Công dụng: Dùng cho API "Lấy/Sửa/Xóa một chiếc xe cụ thể" để đảm bảo bảo mật.
    Optional<Vehicle> findByVehicleIdAndUser_Username(Integer vehicleId, String username);
}
