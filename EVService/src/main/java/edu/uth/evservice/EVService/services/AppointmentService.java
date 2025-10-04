package edu.uth.evservice.EVService.services;

// import edu.uth.evservice.EVService.dto.AppointmentDto;
import edu.uth.evservice.EVService.requests.AppointmentRequest;
import edu.uth.evservice.EVService.respones.AppointmentResponse;

import java.util.List;

public interface AppointmentService {
    List<AppointmentResponse> getAllAppointments();
    AppointmentResponse getAppointmentById(int id);
    AppointmentResponse createAppointment(AppointmentRequest request);
    AppointmentResponse updateAppointment(int id, AppointmentRequest request);
    void deleteAppointment(int id);
}