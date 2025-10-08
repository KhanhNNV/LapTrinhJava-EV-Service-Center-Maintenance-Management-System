package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.EmployeeDto;
import edu.uth.evservice.EVService.requests.EmployeeRequest;

import java.util.List;

public interface IEmployeeService {
    List<EmployeeDto> getAllEmployees();
    EmployeeDto getEmployeeById(Integer id);
    EmployeeDto createEmployee(EmployeeRequest request);
    EmployeeDto updateEmployee(Integer id, EmployeeRequest request);
    void deleteEmployee(Integer id);
}
