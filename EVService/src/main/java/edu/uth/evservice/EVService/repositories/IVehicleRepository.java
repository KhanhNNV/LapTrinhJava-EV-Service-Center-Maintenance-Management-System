package edu.uth.evservice.EVService.repositories;

import edu.uth.evservice.EVService.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IVehicleRepository extends JpaRepository<Vehicle, Integer> {
    List<Vehicle> findByUser_UserId(Integer userId);
    List<Vehicle> findByServiceCenter_CenterId(Integer centerId);
    Vehicle findByLicensePlate(String licensePlate);
    // Công dụng: Kiểm tra nhanh sự tồn tại của một biển số trong bảng 'vehicles'.
    boolean existsByLicensePlate(String licensePlate);
}
