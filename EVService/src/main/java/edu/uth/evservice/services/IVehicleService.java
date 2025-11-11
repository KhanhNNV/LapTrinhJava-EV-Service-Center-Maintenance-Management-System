package edu.uth.evservice.services;

import edu.uth.evservice.dtos.VehicleDto;
import edu.uth.evservice.requests.VehicleRequest;


public interface IVehicleService {
    VehicleDto registerVehicle(VehicleRequest request, Integer customerId);
}
