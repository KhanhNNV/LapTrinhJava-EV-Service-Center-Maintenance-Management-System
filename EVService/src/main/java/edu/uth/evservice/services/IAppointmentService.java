package edu.uth.evservice.services;

import java.util.List;

import edu.uth.evservice.dtos.AppointmentDto;
import edu.uth.evservice.dtos.TechnicianWithCertificateDto;
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
    List<AppointmentDto> getAppointmentsByStatus(String status);

    // --- LOGIC MỚI CHO WORKFLOW ---

    // confirm cho khach hang
    AppointmentDto confirmForCustomer(Integer appointmentId, Integer staffId);

    // check-in chi can xac nhan role admin, staff
    AppointmentDto checkInAppointment(Integer appointmentId);

    // lay danh sach tech goi y cho lich hen theo certificate
    List<TechnicianWithCertificateDto> getSuggestedTechniciansForAppointment(Integer appointmentId);

    // phan cong appointment cho tech
    AppointmentDto assignTechnician(Integer appointmentId, Integer technicianId);

    // List<AppointmentDto> getCheckedInAppointments(); // staff lay danh sach
    // appoint da checkin

    // Methods for Customer
    AppointmentDto createAppointmentForCustomer(Integer username, AppointmentRequest request);

    AppointmentDto cancelAppointmentForCustomer(Integer appointmentId, Integer customerId);

    // Methods for Technician
    List<AppointmentDto> getAppointmentByTechinician(Integer technicianId);

}