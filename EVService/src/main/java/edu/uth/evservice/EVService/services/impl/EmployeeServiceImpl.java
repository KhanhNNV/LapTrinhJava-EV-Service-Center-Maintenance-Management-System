package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.EmployeeDto;
import edu.uth.evservice.EVService.model.employee.Employee;
import edu.uth.evservice.EVService.model.employee.EmployeeFactory;
import edu.uth.evservice.EVService.repositories.IEmployeeRepository;
import edu.uth.evservice.EVService.requests.EmployeeRequest;
import edu.uth.evservice.EVService.services.IEmployeeService;
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
public class EmployeeServiceImpl implements IEmployeeService {

    IEmployeeRepository employeeRepository;
    PasswordEncoder passwordEncoder;

    @Override
    public List<EmployeeDto> getAllEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeDto getEmployeeById(Integer id) {
        return employeeRepository.findById(id)
                .map(this::toDto)
                .orElse(null);
    }

    @Override
    public EmployeeDto createEmployee(EmployeeRequest request) {
        Employee employee = EmployeeFactory.createEmployee(request.getRole());
        employee.setUsername(request.getUsername());
        employee.setFullName(request.getFullName());
        employee.setEmail(request.getEmail());
        employee.setAddress(request.getAddress());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setCenterId(request.getCenterId());
        employee.setPassword(passwordEncoder.encode(request.getPassword()));

        Employee saved = employeeRepository.save(employee);
        return toDto(saved);
    }

    @Override
    public EmployeeDto updateEmployee(Integer id, EmployeeRequest request) {
        return employeeRepository.findById(id).map(
                existing -> {
                    existing.setFullName(request.getFullName());
                    existing.setUsername(request.getUsername());
                    existing.setEmail(request.getEmail());
                    existing.setAddress(request.getAddress());
                    existing.setPhoneNumber(request.getPhoneNumber());
                    existing.setCenterId(request.getCenterId());
                    if (request.getPassword() != null && !request.getPassword().isBlank()) {
                        existing.setPassword(passwordEncoder.encode(request.getPassword()));
                    }
                    Employee updated = employeeRepository.save(existing);
                    return toDto(updated);
                })
                .orElse(null);
    }

    @Override
    public void deleteEmployee(Integer id) {
        employeeRepository.deleteById(id.intValue());

    }

    private EmployeeDto toDto(Employee employee) {
        EmployeeDto dto = new EmployeeDto();
        dto.setId(employee.getEmployeeId().intValue());
        dto.setFullName(employee.getFullName());
        dto.setEmail(employee.getEmail());
        dto.setRole(employee.getClass().getSimpleName());
        return dto;
    }
}
