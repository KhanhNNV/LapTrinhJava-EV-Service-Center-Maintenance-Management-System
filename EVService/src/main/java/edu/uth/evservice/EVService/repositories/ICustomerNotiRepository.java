package edu.uth.evservice.EVService.repositories;

import edu.uth.evservice.EVService.model.CustomerNoti;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ICustomerNotiRepository extends JpaRepository<CustomerNoti, Integer> {
    List<CustomerNoti> findByCustomerId(int customerId);
    List<CustomerNoti> findByReadStatus(boolean readStatus);
}
