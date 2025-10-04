package edu.uth.evservice.EVService.repositories;

import edu.uth.evservice.EVService.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ICustomerRepository extends JpaRepository<Customer,Integer> {
    Customer findByEmail(String email);
}
