package edu.uth.evservice.EVService.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.uth.evservice.EVService.model.Inventory;

public interface IInventoryRepository extends JpaRepository<Inventory, Integer> {
}
