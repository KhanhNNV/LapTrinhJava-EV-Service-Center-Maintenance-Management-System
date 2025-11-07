package edu.uth.evservice.services;

import java.util.List;

import edu.uth.evservice.dtos.AppointmentDto;
import edu.uth.evservice.requests.AppointmentRequest;

public interface IAppointmentService {
    List<AppointmentDto> getAllAppointments();

    AppointmentDto getAppointmentById(Integer id);

    AppointmentDto updateAppointment(Integer id, AppointmentRequest request);

    void deleteAppointment(Integer id);

    AppointmentDto updateStatus(Integer appointmentId, String status);

    List<AppointmentDto> getByCustomer(Integer customerId);

    List<AppointmentDto> getByStaff(Integer staffId);

    // lay lich hen theo status
    List<AppointmentDto> getAppointmentsByStatus(String status, boolean isUserAccepted);

    // --- LOGIC MỚI CHO WORKFLOW ---

    // confirm cho khach hang
    AppointmentDto confirmForCustomer(Integer appointmentId, String staffUserName);

    // check-in chi can xac nhan role admin, staff
    AppointmentDto checkInAppointment(Integer appointmentId, boolean isUserAccepted);

    // phan cong appointment cho tech
    AppointmentDto assignTechnician(Integer appointmentId, Integer technicianId);

    // List<AppointmentDto> getCheckedInAppointments(); // staff lay danh sach
    // appoint da checkin

    // Methods for Customer
    AppointmentDto createAppointmentForCustomer(String username, AppointmentRequest request);

    AppointmentDto cancelAppointmentForCustomer(Integer appointmentId, String username);

    // Methods for Technician
    List<AppointmentDto> getAppointmentByTechinician(String username);

}