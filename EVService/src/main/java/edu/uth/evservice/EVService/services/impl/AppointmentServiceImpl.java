package edu.uth.evservice.EVService.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

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
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

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
        return appointmentRepository.findByStaff_UserId(staffId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public AppointmentDto assignTechnicianAndConfirm(Integer appointmentId, Integer technicianId, String staffUsername ) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new EntityNotFoundException("Technician not found"));
        User staff = userRepository.findByUsername(staffUsername)
                .orElseThrow(() -> new EntityNotFoundException("Staff not found with username: " + staffUsername));

        //Tìm tech trống lịch
        List<Appointment> technicianAppointments = appointmentRepository
                .findByAssignedTechnician_UserIdAndAppointmentDate(technicianId, appointment.getAppointmentDate());
        if (!technicianAppointments.isEmpty()) {
            throw new IllegalStateException("Technician is already assigned to another appointment on this date.");
        }

        appointment.setStaff(staff);
        appointment.setAssignedTechnician(technician);
        appointment.setStatus(AppointmentStatus.CONFIRMED);

        //có tech và staff
        return toDtoFull(appointmentRepository.save(appointment));
    }

    @Override
    public AppointmentDto checkInAppointment(Integer appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException("Only confirmed appointments can be checked in.");
        }

        appointment.setStatus(AppointmentStatus.CHECKED_IN);
        return toDtoFull(appointmentRepository.save(appointment));
    }

    @Override
    public List<AppointmentDto> getConfirmedAppointmentsForTechnician(Integer technicianId) {
        return appointmentRepository
                .findByAssignedTechnician_UserIdAndStatus(technicianId, AppointmentStatus.CONFIRMED)
                .stream().map(this::toDto).collect(Collectors.toList());
    }
    @Override
    public List<AppointmentDto> getAppointmentByTechinician(Integer technicianId) {
        return appointmentRepository
                .findByAssignedTechnician_UserId(technicianId)
                .stream().map(this::toDtoFull).collect(Collectors.toList());
    }

    @Override
    public AppointmentDto createAppointmentForCustomer(String username, AppointmentRequest request) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with username: " + username));

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with ID: " + request.getVehicleId()));

        // Security Check: Đảm bảo khách hàng chỉ đặt lịch cho xe của chính mình.
        if (!vehicle.getUser().getUserId().equals(customer.getUserId())) {
            throw new SecurityException("Forbidden: You can only book appointments for your own vehicles.");
        }

        ServiceCenter center = centerRepository.findById(request.getCenterId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Service Center not found with ID: " + request.getCenterId()));

        Appointment appointment = Appointment.builder()
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .serviceType(request.getServiceType())
                .note(request.getNote())
                .customer(customer) // Người sở hữu lịch hẹn
                .vehicle(vehicle)
                .center(center)
                .status(AppointmentStatus.PENDING) // Luôn bắt đầu là PENDING
                .build();

        appointmentRepository.save(appointment);
        return toDto(appointment);
    }

    @Override
    public AppointmentDto cancelAppointmentForCustomer(Integer appointmentId, String username) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with username: " + username));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found with ID: " + appointmentId));

        // Security Check: Đảm bảo khách hàng chỉ hủy lịch hẹn của chính mình.
        if (!appointment.getCustomer().getUserId().equals(customer.getUserId())) {
            throw new SecurityException("Forbidden: You are not authorized to cancel this appointment.");
        }

        // Business Rule Check: Chỉ cho phép hủy khi đang PENDING hoặc CONFIRMED.
        if (appointment.getStatus() != AppointmentStatus.PENDING
                && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Appointment cannot be canceled because it is already " + appointment.getStatus());
        }

        appointment.setStatus(AppointmentStatus.CANCELED);
        appointment.setNote(appointment.getNote() + " [Canceled by customer]");
        appointmentRepository.save(appointment);
        return toDto(appointment);
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
                .vehicleId(a.getVehicle().getVehicleId())
                .centerId(a.getCenter().getCenterId())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }

    //Response có tech và staff
    private AppointmentDto toDtoFull(Appointment a) {
        return AppointmentDto.builder()
                .appointmentId(a.getAppointmentId())
                .appointmentDate(a.getAppointmentDate())
                .appointmentTime(a.getAppointmentTime())
                .serviceType(a.getServiceType())
                .status(a.getStatus().name())
                .note(a.getNote())
                .customerId(a.getCustomer().getUserId())
                .customerName(a.getCustomer().getFullName())
                .staffId(a.getStaff().getUserId())
                .staffName(a.getStaff().getFullName())
                .vehicleId(a.getVehicle().getVehicleId())
                .centerId(a.getCenter().getCenterId())
                .technicianId(a.getAssignedTechnician().getUserId())
                .technicianName(a.getAssignedTechnician().getFullName())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }

}