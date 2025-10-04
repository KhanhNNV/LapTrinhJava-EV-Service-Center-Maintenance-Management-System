package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.CustomerDto;
import edu.uth.evservice.EVService.requests.CreateCustomerRequest;

import java.util.List;

public interface ICustomerService {
    List<CustomerDto> getAllCustomers();
    CustomerDto getCustomerById(Integer id);
    CustomerDto createCustomer(CreateCustomerRequest request);
    CustomerDto updateCustomer(Integer id, CreateCustomerRequest request);
    void deleteCustomer(Integer id);
}
