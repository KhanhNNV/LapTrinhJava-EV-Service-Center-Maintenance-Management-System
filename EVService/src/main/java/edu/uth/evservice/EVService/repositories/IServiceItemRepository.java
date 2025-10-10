package edu.uth.evservice.EVService.repositories;

import edu.uth.evservice.EVService.model.ServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IServiceItemRepository extends JpaRepository<ServiceItem, Integer> {
}
