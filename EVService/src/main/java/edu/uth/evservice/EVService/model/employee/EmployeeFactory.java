package edu.uth.evservice.EVService.model.employee;

public class EmployeeFactory {
    public static Employee createEmployee(String role) {
        if (role == null) {
            throw new IllegalArgumentException("Role cannot be null");
        }
        switch (role.toLowerCase()) {
            case "staff":
                return new Staff();
            case "technician":
                return new Technician();
            case "admin":
                return new Admin();
            default:
                throw new IllegalArgumentException("Invalid employee role: " + role);
        }
    }
}
