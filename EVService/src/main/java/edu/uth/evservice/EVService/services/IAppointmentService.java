package edu.uth.evservice.EVService.services;

import java.time.LocalDate;
import java.util.List;

import edu.uth.evservice.EVService.dto.AppointmentDto;
import edu.uth.evservice.EVService.requests.AppointmentRequest;

public interface IAppointmentService {
    List<AppointmentDto> getAllAppointments();

    AppointmentDto getAppointmentById(Integer id);

    AppointmentDto createAppointment(AppointmentRequest request);

    AppointmentDto updateAppointment(Integer id, AppointmentRequest request);

    void deleteAppointment(Integer id);

    AppointmentDto updateStatus(Integer appointmentId, String status);

    List<AppointmentDto> getByCustomer(Integer customerId);

    List<AppointmentDto> getByStaff(Integer staffId);

    // lấy ds "Lịch hẹn" dùng làm lịch làm việc cho kỹ thuật viên trong khoảng thời
    // gian
    List<AppointmentDto> getSchedulesForTechnician(Integer technicianId, LocalDate startDate, LocalDate endDate);

}