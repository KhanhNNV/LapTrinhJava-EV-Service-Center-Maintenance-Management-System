package edu.uth.evservice.repositories;

import edu.uth.evservice.models.CustomerPackageContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ICustomerPackageContractRepository extends JpaRepository<CustomerPackageContract, Integer> {
    List<CustomerPackageContract> findByUser_UserId(Integer userId);
}