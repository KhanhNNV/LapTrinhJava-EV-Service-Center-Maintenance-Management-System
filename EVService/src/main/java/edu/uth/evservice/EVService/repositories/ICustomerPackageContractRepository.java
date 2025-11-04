package edu.uth.evservice.EVService.repositories;

import edu.uth.evservice.EVService.model.CustomerPackageContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ICustomerPackageContractRepository extends JpaRepository<CustomerPackageContract, Integer> {
    List<CustomerPackageContract> findByUser_UserId(Integer userId);
}