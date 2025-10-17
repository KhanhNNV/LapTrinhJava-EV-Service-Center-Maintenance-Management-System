package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.AppointmentDto;
import edu.uth.evservice.EVService.requests.AppointmentRequest;
// import edu.uth.evservice.EVService.respones.AppointmentResponse;

import java.util.List;

public interface IAppointmentService {
    List<AppointmentDto> getAllAppointments();
    AppointmentDto getAppointmentById(Integer id);
    AppointmentDto createAppointment(AppointmentRequest request);
    AppointmentDto updateAppointment(Integer id, AppointmentRequest request);
    void deleteAppointment(Integer id);
    AppointmentDto updateStatus(Integer appointmentId, String status);
    List<AppointmentDto> getByCustomer(Integer customerId);
    List<AppointmentDto> getByStaff(Integer staffId);
}