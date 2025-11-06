package edu.uth.evservice.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.uth.evservice.models.Inventory;

public interface IInventoryRepository extends JpaRepository<Inventory, Integer> {
    Optional<Inventory> findByPart_PartId(Integer partId);

}
