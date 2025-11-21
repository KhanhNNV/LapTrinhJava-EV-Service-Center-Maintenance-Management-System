package edu.uth.evservice.repositories;

import java.util.List;
import java.util.Optional;

import edu.uth.evservice.models.ServiceCenter;
import org.springframework.data.jpa.repository.JpaRepository;

import edu.uth.evservice.models.Inventory;

public interface IInventoryRepository extends JpaRepository<Inventory, Integer> {
    Optional<Inventory> findByPart_PartId(Integer partId);
    List<Inventory> findByServiceCenter_CenterId(Integer id);

    List<Inventory> findAllByPart_PartId(Integer partId);
    Optional<Inventory> findByPart_PartIdAndServiceCenter(Integer partId, ServiceCenter center);

    boolean existsByPart_PartIdAndServiceCenter_CenterId(Integer partId, Integer centerId);

    List<Inventory> findByServiceCenter(ServiceCenter serviceCenter);
    // Tìm tất cả hàng tồn kho của một trung tâm cụ thể -> Trả về List


}
