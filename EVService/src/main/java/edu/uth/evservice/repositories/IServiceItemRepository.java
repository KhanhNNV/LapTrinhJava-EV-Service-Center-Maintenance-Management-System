package edu.uth.evservice.repositories;

import edu.uth.evservice.models.ServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IServiceItemRepository extends JpaRepository<ServiceItem, Integer> {

}
