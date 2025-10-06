package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.AppointmentDto;
import edu.uth.evservice.EVService.model.Appointment;
import edu.uth.evservice.EVService.repositories.IAppointmentRepository;
import edu.uth.evservice.EVService.requests.AppointmentRequest;
import edu.uth.evservice.EVService.services.IAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements IAppointmentService {

    private final IAppointmentRepository appointmentRepository;

    @Override
    public List<AppointmentDto> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentDto getAppointmentById(int id) {
        return appointmentRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
    }

    @Override
    public AppointmentDto createAppointment(AppointmentRequest request) {
        Appointment appointment = Appointment.builder()
                .customerId(request.getCustomerId())
                .centerId(request.getCenterId())
                .employeeId(request.getEmployeeId())
                .appointmentDate(request.getAppointmentDate())
                .serviceType(request.getServiceType())
                .status("pending")
                .note(request.getNote())
                .build();
        return toDto(appointmentRepository.save(appointment));
    }

    @Override
    public AppointmentDto updateAppointment(int id, AppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setServiceType(request.getServiceType());
        appointment.setNote(request.getNote());
        appointment.setEmployeeId(request.getEmployeeId());

        return toDto(appointmentRepository.save(appointment));
    }

    @Override
    public void deleteAppointment(int id) {
        appointmentRepository.deleteById(id);
    }

    private AppointmentDto toDto(Appointment appointment) {
        return AppointmentDto.builder()
                .appointmentId(appointment.getAppointmentId())
                .appointmentDate(appointment.getAppointmentDate())
                .serviceType(appointment.getServiceType())
                .status(appointment.getStatus())
                .note(appointment.getNote())
                .build();
    }
}