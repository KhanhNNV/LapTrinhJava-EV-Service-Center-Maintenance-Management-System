package edu.uth.evservice.EVService.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.uth.evservice.EVService.model.Inventory;

public interface IInventoryRepository extends JpaRepository<Inventory, Integer> {
    List<Inventory> findByPartId(Integer part_id);

    List<Inventory> findByCenterId(Integer center_id);
}
