package edu.uth.evservice.services;

import java.util.List;

import edu.uth.evservice.dtos.CustomerPackageContractDto;
import edu.uth.evservice.requests.CustomerPackageContractRequest;

public interface ICustomerPackageContractService {
    List<CustomerPackageContractDto> getAllContracts();
    CustomerPackageContractDto getContractById(Integer id);
    List<CustomerPackageContractDto> getContractsByCustomerId(Integer customerId);
    CustomerPackageContractDto createContract(CustomerPackageContractRequest request);
    CustomerPackageContractDto updateContract(Integer id, CustomerPackageContractRequest request);
    void deleteContract(Integer id);

}
