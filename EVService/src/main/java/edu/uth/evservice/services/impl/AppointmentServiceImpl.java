package edu.uth.evservice.services.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import edu.uth.evservice.dtos.AppointmentDto;
import edu.uth.evservice.models.Appointment;
import edu.uth.evservice.models.CustomerPackageContract;
import edu.uth.evservice.models.ServiceCenter;
import edu.uth.evservice.models.User;
import edu.uth.evservice.models.Vehicle;
import edu.uth.evservice.models.enums.AppointmentStatus;
import edu.uth.evservice.models.enums.ContractStatus;
import edu.uth.evservice.repositories.IAppointmentRepository;
import edu.uth.evservice.repositories.ICustomerPackageContractRepository;
import edu.uth.evservice.repositories.IServiceCenterRepository;
import edu.uth.evservice.repositories.IUserRepository;
import edu.uth.evservice.repositories.IVehicleRepository;
import edu.uth.evservice.requests.AppointmentRequest;
import edu.uth.evservice.services.IAppointmentService;
import edu.uth.evservice.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements IAppointmentService {

    private final IAppointmentRepository appointmentRepository;
    private final IUserRepository userRepository;
    private final IVehicleRepository vehicleRepository;
    private final IServiceCenterRepository centerRepository;
    private final ICustomerPackageContractRepository contractRepository;

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
        // if (request.getStatus() != null)
        // appointment.setStatus(AppointmentStatus.valueOf(request.getStatus().toUpperCase()));

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

    // @Override
    // public AppointmentDto assignTechnicianAndConfirm(Integer appointmentId,
    // Integer technicianId,
    // String staffUsername) {
    // Appointment appointment = appointmentRepository.findById(appointmentId)
    // .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
    // User technician = userRepository.findById(technicianId)
    // .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));
    // User staff = userRepository.findByUsername(staffUsername)
    // .orElseThrow(() -> new ResourceNotFoundException("Staff not found with
    // username: " + staffUsername));

    // // kiem tra neu appointment da bi huy hoac da xac nhan
    // if (appointment.getStatus() == AppointmentStatus.CANCELED) {
    // throw new IllegalStateException("Cannot confirm a canceled appointment.");
    // }
    // if (appointment.getStatus() == AppointmentStatus.CONFIRMED) {
    // throw new IllegalStateException("Appointment is already confirmed.");
    // }

    // // Tìm tech trống lịch
    // List<Appointment> technicianAppointments = appointmentRepository
    // .findByAssignedTechnician_UserIdAndAppointmentDate(technicianId,
    // appointment.getAppointmentDate());
    // if (!technicianAppointments.isEmpty()) {
    // throw new IllegalStateException("Technician is already assigned to another
    // appointment on this date.");
    // }

    // appointment.setStaff(staff);
    // appointment.setAssignedTechnician(technician);
    // appointment.setStatus(AppointmentStatus.CONFIRMED);

    // // có tech và staff
    // return toDtoFull(appointmentRepository.save(appointment));
    // }

    // confirm cho khach hang
    @Override
    public AppointmentDto confirmForCustomer(Integer appointmentId, String staffUsername) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        User staff = userRepository.findByUsername(staffUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with username: " + staffUsername));

        // kiem tra neu appointment da bi huy hoac da xac nhan
        if (appointment.getStatus() == AppointmentStatus.CANCELED) {
            throw new IllegalStateException("Cannot confirm a canceled appointment.");
        }
        if (appointment.getStatus() == AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException("Appointment is already confirmed.");
        }

        if (appointment.getStatus() != AppointmentStatus.CHECKED_IN) {
            throw new IllegalStateException("Appointment is already checked-in");
        }

        appointment.setStaff(staff);
        appointment.setStatus(AppointmentStatus.CONFIRMED);

        // có tech và staff
        return toDto(appointmentRepository.save(appointment));
    }

    // checkin cho customer
    @Override
    public AppointmentDto checkInAppointment(Integer appointmentId, boolean isUserAccepted) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException("Only confirmed appointments can be checked in.");
        }

        if (!isUserAccepted) {
            throw new AccessDeniedException("You are not allowed to check in!");
        }

        appointment.setStatus(AppointmentStatus.CHECKED_IN);
        appointment.setUpdatedAt(LocalDateTime.now());
        return toDto(appointmentRepository.save(appointment));
    }

    // giao lich cho technician
    @Override
    public AppointmentDto assignTechnician(Integer appointmentId, Integer technicianId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));

        // kiem tra appointment da checkin
        if (appointment.getStatus() != AppointmentStatus.CHECKED_IN) {
            throw new IllegalStateException("Technicians cannot be assigned to unregistered appointments.");
        }

        // Kiểm tra KTV có đang bận (có lịch IN_PROGRESS trong ngày) không
        List<Appointment> inProgressAppointments = appointmentRepository
                .findByAssignedTechnician_UserIdAndStatus(technicianId, AppointmentStatus.IN_PROGRESS);

        if (!inProgressAppointments.isEmpty()) {
            throw new IllegalStateException(
                    "Technician is currently working on another appointment (IN_PROGRESS). Cannot assign new one.");
        }

        // kiem tra so lich duoc giao trong ngay gioi han la 3
        boolean isBusy = appointmentRepository
                .findByAssignedTechnician_UserIdAndAppointmentDate(technicianId, appointment.getAppointmentDate())
                .size() > 3;
        if (isBusy) {
            throw new IllegalStateException("Technicians are now taking maximum appointments per day.");
        }

        appointment.setAssignedTechnician(technician);
        appointment.setStatus(AppointmentStatus.ASSIGNED);

        return toDto(appointmentRepository.save(appointment));
    }

    @Override
    public List<AppointmentDto> getAppointmentByTechinician(String username) {
        User tech = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with username: " + username));

        return appointmentRepository
                .findByAssignedTechnician_UserId(tech.getUserId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // dat lich hen cho customer
    @Override
    public AppointmentDto createAppointmentForCustomer(String username, AppointmentRequest request) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with username: " + username));

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + request.getVehicleId()));

        ServiceCenter center = centerRepository.findById(request.getCenterId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service Center not found with ID: " + request.getCenterId()));

        // Security Check: Đảm bảo khách hàng chỉ đặt lịch cho xe của chính mình.
        if (!vehicle.getUser().getUserId().equals(customer.getUserId())) {
            throw new SecurityException("Forbidden: You can only book appointments for your own vehicles.");
        }

        // xu li contract
        CustomerPackageContract contract = null;
        if (request.getContractId() != null) {
            contract = contractRepository.findById(request.getContractId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Contract not found with id: " + request.getContractId()));
            // kiem tra contract thuoc ve khach hang
            if (!contract.getUser().getUserId().equals(customer.getUserId())) {
                throw new SecurityException("Forbidden: This contract does not belong to you.");
            }
            // Business Rule: Kiểm tra contract còn hạn và active
            if (contract.getStatus() != ContractStatus.ACTIVE || contract.getEndDate().isBefore(LocalDate.now())) {
                throw new IllegalStateException("This contract is not active or has expired.");
            }
        }

        Appointment appointment = Appointment.builder()
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .serviceType(request.getServiceType())
                .note(request.getNote())
                .customer(customer) // Người sở hữu lịch hẹn
                .vehicle(vehicle)
                .center(center)
                .createdAt(LocalDateTime.now())
                .status(AppointmentStatus.PENDING) // Luôn bắt đầu là PENDING
                .contract(contract)
                .build();

        appointmentRepository.save(appointment);
        return toDto(appointment);
    }

    // huy lich hen cua customer
    @Override
    public AppointmentDto cancelAppointmentForCustomer(Integer appointmentId, String username) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with username: " + username));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

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
        appointment.setAssignedTechnician(null); // Bỏ gán kỹ thuật viên khi hủy
        appointment.setUpdatedAt(LocalDateTime.now());
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
                .staffId(a.getStaff() != null ? a.getStaff().getUserId() : null)
                .staffName(a.getStaff() != null ? a.getStaff().getFullName() : null)
                .technicianId(a.getAssignedTechnician() != null ? a.getAssignedTechnician().getUserId() : null)
                .technicianName(a.getAssignedTechnician() != null ? a.getAssignedTechnician().getFullName() : null)
                .vehicleId(a.getVehicle().getVehicleId())
                .centerId(a.getCenter().getCenterId())
                .contractId(a.getContract() != null ? a.getContract().getContractId() : null)
                .contractName(a.getContract() != null ? a.getContract().getContractName() : null)
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }

}