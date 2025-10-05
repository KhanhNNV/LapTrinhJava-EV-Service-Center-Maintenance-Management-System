package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.AppointmentDto;
import edu.uth.evservice.EVService.requests.AppointmentRequest;
// import edu.uth.evservice.EVService.respones.AppointmentResponse;

import java.util.List;

public interface IAppointmentService {
    List<AppointmentDto> getAllAppointments();
    AppointmentDto getAppointmentById(int id);
    AppointmentDto createAppointment(AppointmentRequest request);
    AppointmentDto updateAppointment(int id, AppointmentRequest request);
    void deleteAppointment(int id);
}