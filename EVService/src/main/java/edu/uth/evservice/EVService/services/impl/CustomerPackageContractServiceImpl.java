package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.CustomerPackageContractDto;

import edu.uth.evservice.EVService.model.CustomerPackageContract;
import edu.uth.evservice.EVService.model.ServicePackage;
import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.model.enums.ContractStatus;
import edu.uth.evservice.EVService.repositories.ICustomerPackageContractRepository;
import edu.uth.evservice.EVService.repositories.IUserRepository;
import edu.uth.evservice.EVService.repositories.IServicePackageRepository;
import edu.uth.evservice.EVService.requests.CustomerPackageContractRequest;
import edu.uth.evservice.EVService.services.ICustomerPackageContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerPackageContractServiceImpl implements ICustomerPackageContractService {

    private final ICustomerPackageContractRepository contractRepository;
    private final IUserRepository  userRepository;
    private final IServicePackageRepository packageRepository;

    private CustomerPackageContractDto toDto(CustomerPackageContract contract) {
        return CustomerPackageContractDto.builder()
                .contractId(contract.getContractId())
                .customerId(contract.getUser().getUserId())
                .customerName(contract.getUser().getFullName())
                .packageId(contract.getServicePackage().getPackageId())
                .packageName(contract.getServicePackage().getPackageName())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .status(contract.getStatus().name())
                .build();
    }

    @Override
    public List<CustomerPackageContractDto> getAllContracts() {
        return contractRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerPackageContractDto getContractById(Integer id) {
        return contractRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Contract not found with id: " + id));
    }

    @Override
    public List<CustomerPackageContractDto> getContractsByCustomerId(Integer userId) {
        return contractRepository.findByUser_UserId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerPackageContractDto createContract(CustomerPackageContractRequest request) {

        User customer = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + request.getUserId()));
        ServicePackage servicePackage = packageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new RuntimeException("ServicePackage not found with id: " + request.getPackageId()));


        CustomerPackageContract contract = CustomerPackageContract.builder()
                .user(customer)
                .servicePackage(servicePackage)
                .startDate(request.getStartDate())
                .endDate(request.getStartDate().plusDays(servicePackage.getDuration()))
                .status(ContractStatus.valueOf(request.getStatus().toUpperCase()))
                .build();


        CustomerPackageContract savedContract = contractRepository.save(contract);
        return toDto(savedContract);
    }

    @Override
    public CustomerPackageContractDto updateContract(Integer id, CustomerPackageContractRequest request) {
        // Tìm hợp đồng hiện có
        CustomerPackageContract existingContract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found with id: " + id));

        // Tìm kiếm các entity liên quan (nếu có sự thay đổi)
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + request.getUserId()));
        ServicePackage servicePackage = packageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new RuntimeException("ServicePackage not found with id: " + request.getPackageId()));

        // Cập nhật thông tin cho hợp đồng
        existingContract.setUser(user);
        existingContract.setServicePackage(servicePackage);
        existingContract.setStartDate(request.getStartDate());
        existingContract.setEndDate(request.getStartDate().plusDays(servicePackage.getDuration()));
        existingContract.setStatus((ContractStatus.valueOf(request.getStatus().toUpperCase())));

        // Lưu thay đổi và trả về DTO
        CustomerPackageContract updatedContract = contractRepository.save(existingContract);
        return toDto(updatedContract);
    }

    @Override
    public void deleteContract(Integer id) {
        if (!contractRepository.existsById(id)) {
            throw new RuntimeException("Contract not found with id: " + id);
        }
        contractRepository.deleteById(id);
    }
}