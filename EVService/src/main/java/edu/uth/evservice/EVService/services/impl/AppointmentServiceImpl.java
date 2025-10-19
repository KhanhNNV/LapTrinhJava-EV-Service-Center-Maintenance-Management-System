package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.AppointmentDto;
import edu.uth.evservice.EVService.model.Appointment;
import edu.uth.evservice.EVService.model.ServiceCenter;
import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.model.Vehicle;
import edu.uth.evservice.EVService.model.enums.AppointmentStatus;
import edu.uth.evservice.EVService.repositories.IAppointmentRepository;
import edu.uth.evservice.EVService.repositories.IServiceCenterRepository;
import edu.uth.evservice.EVService.repositories.IUserRepository;
import edu.uth.evservice.EVService.repositories.IVehicleRepository;
import edu.uth.evservice.EVService.requests.AppointmentRequest;
import edu.uth.evservice.EVService.services.IAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements IAppointmentService {

    private final IAppointmentRepository appointmentRepository;
    private final IUserRepository userRepository;
    private final IVehicleRepository vehicleRepository;
    private final IServiceCenterRepository centerRepository;

    @Override
    public List<AppointmentDto> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentDto getAppointmentById(Integer id) {
        return appointmentRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
    }


    @Override
    public AppointmentDto createAppointment(AppointmentRequest request) {
        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        User staff = userRepository.findById(request.getCreatedById())
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        ServiceCenter center = centerRepository.findById(request.getCenterId())
                .orElseThrow(() -> new RuntimeException("Center not found"));

        Appointment appointment = Appointment.builder()
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .status(AppointmentStatus.valueOf(request.getStatus().toUpperCase()))
                .serviceType(request.getServiceType())
                .note(request.getNote())
                .customer(customer)
                .createdBy(staff)
                .vehicle(vehicle)
                .center(center)
                .build();

        appointmentRepository.save(appointment);
        return toDto(appointment);
    }

    @Override
    public AppointmentDto updateAppointment(Integer id, AppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        if (request.getAppointmentDate() != null)
            appointment.setAppointmentDate(request.getAppointmentDate());
        if (request.getAppointmentTime() != null)
            appointment.setAppointmentTime(request.getAppointmentTime());
        if (request.getServiceType() != null)
            appointment.setServiceType(request.getServiceType());
        if (request.getStatus() != null)
           appointment.setStatus(AppointmentStatus.valueOf(request.getStatus().toUpperCase()));

        if (request.getNote() != null)
            appointment.setNote(request.getNote());

        if (request.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new RuntimeException("Vehicle not found"));
            appointment.setVehicle(vehicle);
        }

        if (request.getCenterId() != null) {
            ServiceCenter center = centerRepository.findById(request.getCenterId())
                    .orElseThrow(() -> new RuntimeException("Center not found"));
            appointment.setCenter(center);
        }

        if (request.getCreatedById() != null) {
            User staff = userRepository.findById(request.getCreatedById())
                    .orElseThrow(() -> new RuntimeException("Staff not found"));
            appointment.setCreatedBy(staff);
        }

        appointmentRepository.save(appointment);
        return toDto(appointment);
    }


    @Override
    public void deleteAppointment(Integer id) {
        appointmentRepository.deleteById(id);
    }

    @Override
    public AppointmentDto updateStatus(Integer appointmentId, String status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(AppointmentStatus.valueOf(status.toUpperCase()));
        appointmentRepository.save(appointment);
        return toDto(appointment);
    }

    @Override
    public List<AppointmentDto> getByCustomer(Integer customerId) {
        return appointmentRepository.findByCustomer_UserId(customerId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDto> getByStaff(Integer staffId) {
        return appointmentRepository.findByCreatedBy_UserId(staffId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    private AppointmentDto toDto(Appointment a) {
        return AppointmentDto.builder()
                .appointmentId(a.getAppointmentId())
                .appointmentDate(a.getAppointmentDate())
                .appointmentTime(a.getAppointmentTime())
                .serviceType(a.getServiceType())
                .status(a.getStatus().name())
                .note(a.getNote())
                .customerId(a.getCustomer().getUserId())
                .customerName(a.getCustomer().getFullName())
                .createdById(a.getCreatedBy().getUserId())
                .createdByName(a.getCreatedBy().getFullName())
                .vehicleId(a.getVehicle().getVehicleId())
                .centerId(a.getCenter().getCenterId())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}