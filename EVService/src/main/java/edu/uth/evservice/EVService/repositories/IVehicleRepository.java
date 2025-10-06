package edu.uth.evservice.EVService.repositories;
import edu.uth.evservice.EVService.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IVehicleRepository extends JpaRepository<Vehicle, Integer> {

    // Lấy danh sách xe của 1 khách hàng
    List<Vehicle> findByCustomer_CustomerId(Integer customerId);

    // Lấy danh sách xe theo trung tâm dịch vụ
    List<Vehicle> findByServiceCenter_CenterId(Integer centerId);

    // Tìm xe theo biển số (Unique)
    Vehicle findByLicensePlate(String licensePlate);
}

