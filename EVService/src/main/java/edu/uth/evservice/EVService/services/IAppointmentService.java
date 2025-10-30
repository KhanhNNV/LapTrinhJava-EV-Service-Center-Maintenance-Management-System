package edu.uth.evservice.EVService.services;

import java.util.List;

import edu.uth.evservice.EVService.dto.AppointmentDto;
import edu.uth.evservice.EVService.requests.AppointmentRequest;

public interface IAppointmentService {
    List<AppointmentDto> getAllAppointments();

    AppointmentDto getAppointmentById(Integer id);

    AppointmentDto updateAppointment(Integer id, AppointmentRequest request);

    void deleteAppointment(Integer id);

    AppointmentDto updateStatus(Integer appointmentId, String status);

    List<AppointmentDto> getByCustomer(Integer customerId);

    List<AppointmentDto> getByStaff(Integer staffId);

    // --- LOGIC MỚI CHO WORKFLOW ---
    AppointmentDto assignTechnicianAndConfirm(Integer appointmentId, Integer technicianId, String staffEmail);

    AppointmentDto checkInAppointment(Integer appointmentId, Integer currentTechId, boolean isUserAccepted);

    // Methods for Customer
    AppointmentDto createAppointmentForCustomer(String username, AppointmentRequest request);

    AppointmentDto cancelAppointmentForCustomer(Integer appointmentId, String username);

    // Methods for Technician
    List<AppointmentDto> getAppointmentByTechinician(Integer technicianId);

}