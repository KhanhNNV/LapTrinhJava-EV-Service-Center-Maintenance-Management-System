package edu.uth.evservice.EVService.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.uth.evservice.EVService.model.ServiceItemPart;
import edu.uth.evservice.EVService.model.ServiceItemPartId;

@Repository
public interface IServiceItemPartRepository extends JpaRepository<ServiceItemPart, ServiceItemPartId> {
    List<ServiceItemPart> findByServiceItem_ItemId(Integer itemId);

    List<ServiceItemPart> findByPart_PartId(Integer partId);
}
