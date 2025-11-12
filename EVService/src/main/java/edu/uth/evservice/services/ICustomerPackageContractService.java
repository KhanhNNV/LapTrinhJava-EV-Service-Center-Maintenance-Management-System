package edu.uth.evservice.services;

import java.util.List;

import edu.uth.evservice.dtos.CustomerPackageContractDto;
import edu.uth.evservice.requests.CustomerPackageContractRequest;

public interface ICustomerPackageContractService {
    // List<CustomerPackageContractDto> getAllContracts();
    // CustomerPackageContractDto getContractById(Integer id);
    // List<CustomerPackageContractDto> getContractsByCustomerId(Integer customerId);
    // CustomerPackageContractDto createContract(CustomerPackageContractRequest request);
    // CustomerPackageContractDto updateContract(Integer id, CustomerPackageContractRequest request);
    // void deleteContract(Integer id);

    // Customer mua một gói dịch vụ mới
    CustomerPackageContractDto purchasePackage(CustomerPackageContractRequest request, Integer UserId);

    // Customer xem tất cả hợp đồng của mình
    List<CustomerPackageContractDto> getMyContracts(Integer UserId);

    // Customer xem chi tiết 1 hợp đồng
    CustomerPackageContractDto getMyContractById(Integer contractId, Integer UserId);

    // Customer hủy 1 hợp đồng
    CustomerPackageContractDto cancelMyContract(Integer contractId, Integer UserId);
}
