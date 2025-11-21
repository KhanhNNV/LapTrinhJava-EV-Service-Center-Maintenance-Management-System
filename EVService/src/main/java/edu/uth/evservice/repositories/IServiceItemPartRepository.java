package edu.uth.evservice.repositories;

import edu.uth.evservice.models.ServiceItemPart;
import edu.uth.evservice.models.ServiceItemPartId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IServiceItemPartRepository extends JpaRepository<ServiceItemPart, ServiceItemPartId> {
    List<ServiceItemPart> findByServiceItem_ItemId(Integer itemId);
    void deleteByServiceItem_ItemId(Integer itemId);

}
