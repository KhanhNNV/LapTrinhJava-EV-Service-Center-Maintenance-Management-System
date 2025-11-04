package edu.uth.evservice.controllers;

import edu.uth.evservice.dtos.CustomerPackageContractDto;
import edu.uth.evservice.requests.CustomerPackageContractRequest;
import edu.uth.evservice.services.ICustomerPackageContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class CustomerPackageContractController {

    private final ICustomerPackageContractService contractService;

    @GetMapping
    public List<CustomerPackageContractDto> getAll() {
        return contractService.getAllContracts();
    }

    @GetMapping("/{id}")
    public CustomerPackageContractDto getById(@PathVariable int id) {
        return contractService.getContractById(id);
    }

    @GetMapping("/customer/{userId}")
    public List<CustomerPackageContractDto> getByCustomer(@PathVariable("userId") int customerId) {
        return contractService.getContractsByCustomerId(customerId);
    }

    @PostMapping
    public CustomerPackageContractDto create(@RequestBody CustomerPackageContractRequest request) {
        return contractService.createContract(request);
    }

    @PutMapping("/{id}")
    public CustomerPackageContractDto update(@PathVariable int id,
            @RequestBody CustomerPackageContractRequest request) {
        return contractService.updateContract(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        contractService.deleteContract(id);
        return ResponseEntity.ok().build();
    }
}