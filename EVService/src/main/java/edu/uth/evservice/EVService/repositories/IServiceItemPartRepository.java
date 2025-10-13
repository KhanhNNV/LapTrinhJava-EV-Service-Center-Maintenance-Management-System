package edu.uth.evservice.EVService.repositories;

import edu.uth.evservice.EVService.model.ServiceItemPart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IServiceItemPartRepository extends JpaRepository<ServiceItemPart, Integer> {
    List<ServiceItemPart> findByServiceItem_ItemId(Integer itemId);
}
