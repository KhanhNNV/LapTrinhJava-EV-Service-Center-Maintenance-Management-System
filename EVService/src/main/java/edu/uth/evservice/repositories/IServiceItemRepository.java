package edu.uth.evservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.uth.evservice.models.ServiceItem;

@Repository
public interface IServiceItemRepository extends JpaRepository<ServiceItem, Integer> {
    List<ServiceItem> findAllByItemIdIn(List<Integer> itemIds);
}
