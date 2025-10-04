package edu.uth.evservice.EVService.mapper;

import edu.uth.evservice.EVService.dto.VehicleDto;
import edu.uth.evservice.EVService.requests.VehicleRequest;
import edu.uth.evservice.EVService.model.Customer;
import edu.uth.evservice.EVService.model.ServiceCenter;
import edu.uth.evservice.EVService.model.Vehicle;

public class VehicleMapper {

    public static VehicleDto toDto(Vehicle vehicle) {
        VehicleDto dto = new VehicleDto();
        dto.setVehicleId(vehicle.getVehicleId());
        dto.setModel(vehicle.getModel());
        dto.setBrand(vehicle.getBrand());
        dto.setLicensePlate(vehicle.getLicensePlate());
        dto.setRecentMaintenanceDate(vehicle.getRecentMaintenanceDate());

        if (vehicle.getCustomer() != null) {
            dto.setCustomerId(vehicle.getCustomer().getCustomerId());
            dto.setCustomerName(vehicle.getCustomer().getFullName());
        }

        if (vehicle.getServiceCenter() != null) {
            dto.setServiceCenterId(vehicle.getServiceCenter().getCenterId());
            dto.setServiceCenterName(vehicle.getServiceCenter().getCenterName());
        }

        return dto;
    }

    public static Vehicle toEntity(VehicleRequest request, Customer customer, ServiceCenter center) {
        Vehicle vehicle = new Vehicle();
        vehicle.setModel(request.getModel());
        vehicle.setBrand(request.getBrand());
        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setRecentMaintenanceDate(request.getRecentMaintenanceDate());
        vehicle.setCustomer(customer);
        vehicle.setServiceCenter(center);
        return vehicle;
    }
}
