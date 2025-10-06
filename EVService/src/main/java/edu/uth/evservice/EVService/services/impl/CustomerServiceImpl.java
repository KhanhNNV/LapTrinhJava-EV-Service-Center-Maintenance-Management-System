package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.CustomerDto;
import edu.uth.evservice.EVService.model.Customer;
import edu.uth.evservice.EVService.repositories.ICustomerRepository;
import edu.uth.evservice.EVService.requests.CreateCustomerRequest;
import edu.uth.evservice.EVService.services.ICustomerService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
@AllArgsConstructor
public class CustomerServiceImpl implements ICustomerService {
    ICustomerRepository customerRepository;
    PasswordEncoder passwordEncoder;

    @Override
    public List<CustomerDto> getAllCustomers() {
        return customerRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerDto getCustomerById(Integer id) {
        return customerRepository.findById(id.intValue())
                .map(this::toDto)
                .orElse(null);
    }

    @Override
    public CustomerDto createCustomer(CreateCustomerRequest request) {
        Customer customer = new Customer();
        customer.setFullName(request.getFullName());
        customer.setEmail(request.getEmail());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setAddress(request.getAddress());
        customer.setPassword(passwordEncoder.encode(request.getPassword()));

        Customer saved = customerRepository.save(customer);
        return toDto(saved);
    }

    @Override
    public CustomerDto updateCustomer(Integer id, CreateCustomerRequest request) {
        return customerRepository.findById(id.intValue())
                .map(existing -> {
                    existing.setFullName(request.getFullName());
                    existing.setEmail(request.getEmail());
                    existing.setPhoneNumber(request.getPhoneNumber());
                    existing.setAddress(request.getAddress());
                    if (request.getPassword() != null && !request.getPassword().isBlank()) {
                        existing.setPassword(passwordEncoder.encode(request.getPassword()));
                    }
                    Customer updated = customerRepository.save(existing);
                    return toDto(updated);
                })
                .orElse(null);
    }

    @Override
    public void deleteCustomer(Integer id) {
        customerRepository.deleteById(id.intValue());
    }

    private CustomerDto toDto(Customer customer) {
        CustomerDto dto = new CustomerDto();
        dto.setId(customer.getCustomerId().intValue());
        dto.setFullName(customer.getFullName());
        dto.setEmail(customer.getEmail());
        dto.setPhoneNumber(customer.getPhoneNumber());
        dto.setAddress(customer.getAddress());
        return dto;
    }
}
