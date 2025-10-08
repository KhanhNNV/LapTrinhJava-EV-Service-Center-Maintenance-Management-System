package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.dto.EmployeeDto;
import edu.uth.evservice.EVService.requests.EmployeeRequest;
import edu.uth.evservice.EVService.services.IEmployeeService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employees")
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmployeeController {

    IEmployeeService employeeService;

    @GetMapping
    public List<EmployeeDto> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    @GetMapping("/{id}")
    public EmployeeDto getEmployeeById(@PathVariable Integer id) {
        return employeeService.getEmployeeById(id);
    }

    @PostMapping
    public EmployeeDto createEmployee(@RequestBody EmployeeRequest request) {
        return employeeService.createEmployee(request);
    }

    @PutMapping("/{id}")
    public EmployeeDto updateEmployee(@PathVariable Integer id,
                                      @RequestBody EmployeeRequest request) {
        return employeeService.updateEmployee(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteEmployee(@PathVariable Integer id) {
        employeeService.deleteEmployee(id);
    }
}
