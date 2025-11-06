package edu.uth.evservice.services;

import edu.uth.evservice.dtos.VehicleDto;
import edu.uth.evservice.requests.VehicleRequest;
import java.util.List;

public interface IVehicleService {
    VehicleDto registerVehicle(VehicleRequest request, String customerUsername);
}
