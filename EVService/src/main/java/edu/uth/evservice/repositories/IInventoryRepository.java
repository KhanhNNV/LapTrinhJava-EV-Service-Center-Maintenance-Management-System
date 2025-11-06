package edu.uth.evservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.uth.evservice.models.Inventory;

public interface IInventoryRepository extends JpaRepository<Inventory, Integer> {
    List<Inventory> findByPart_PartId(Integer partId);

    List<Inventory> findByServiceCenter_CenterId(Integer centerId);

}
