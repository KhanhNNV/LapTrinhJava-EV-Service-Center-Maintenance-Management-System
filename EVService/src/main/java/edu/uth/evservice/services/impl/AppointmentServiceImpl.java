package edu.uth.evservice.services.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import edu.uth.evservice.dtos.AppointmentDto;
import edu.uth.evservice.dtos.TechnicianWithCertificateDto;
import edu.uth.evservice.exception.ResourceNotFoundException;
import edu.uth.evservice.models.Appointment;
import edu.uth.evservice.models.CustomerPackageContract;
import edu.uth.evservice.models.ServiceCenter;
import edu.uth.evservice.models.TechnicianCertificate;
import edu.uth.evservice.models.User;
import edu.uth.evservice.models.Vehicle;
import edu.uth.evservice.models.enums.AppointmentStatus;
import edu.uth.evservice.models.enums.CertificateType;
import edu.uth.evservice.models.enums.ContractStatus;
import edu.uth.evservice.repositories.IAppointmentRepository;
import edu.uth.evservice.repositories.ICustomerPackageContractRepository;
import edu.uth.evservice.repositories.IServiceCenterRepository;
import edu.uth.evservice.repositories.ITechnicianCertificateRepository;
import edu.uth.evservice.repositories.IUserRepository;
import edu.uth.evservice.repositories.IVehicleRepository;
import edu.uth.evservice.requests.AppointmentRequest;
import edu.uth.evservice.requests.NotificationRequest;
import edu.uth.evservice.services.IAppointmentService;
import edu.uth.evservice.services.INotificationService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements IAppointmentService {

    private final IAppointmentRepository appointmentRepository;
    private final IUserRepository userRepository;
    private final IVehicleRepository vehicleRepository;
    private final IServiceCenterRepository centerRepository;
    private final ICustomerPackageContractRepository contractRepository;
    private final ITechnicianCertificateRepository technicianCertificateRepository;
    //
    private final INotificationService notificationService;

    // lay tat ca lich hen danh cho admin
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
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn với ID: " + id));
    }

    @Override
    public AppointmentDto updateAppointment(Integer id, AppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn với ID: " + id));

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
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Không tìm thấy xe với ID: " + request.getVehicleId()));
            appointment.setVehicle(vehicle);
        }

        if (request.getCenterId() != null) {
            ServiceCenter center = centerRepository.findById(request.getCenterId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy trung tâm với ID: " + request.getCenterId()));
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
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn với ID: " + appointmentId));
        appointment.setStatus(AppointmentStatus.valueOf(status.toUpperCase()));
        appointmentRepository.save(appointment);
        return toDto(appointment);
    }

    @Override
    public List<AppointmentDto> getByCustomer(Integer customerId) {
        return appointmentRepository.findByCustomer_UserId(customerId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // lay tat ca lich hen thuoc ve staff
    @Override
    public List<AppointmentDto> getByStaff(Integer staffId) {
        return appointmentRepository.findByStaff_UserId(staffId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDto> getMyAppointments(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        List<Appointment> appointments;

        switch (user.getRole()) {
            case CUSTOMER:
                appointments = appointmentRepository.findByCustomer_UserId(userId);
                break;
            case STAFF:
                appointments = appointmentRepository.findByStaff_UserId(userId);
                break;
            case TECHNICIAN:
                appointments = appointmentRepository.findByAssignedTechnician_UserId(userId);
                break;
            default:
                throw new AccessDeniedException("Vai trò người dùng không hợp lệ để xem lịch hẹn.");
        }

        return appointments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // lay lich hen theo status (admin/staff)
    @Override
    public List<AppointmentDto> getAppointmentsByStatus(String status) {
        AppointmentStatus appointmentStatus;
        try {
            appointmentStatus = AppointmentStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ: " + status);
        }

        return appointmentRepository.findByStatus(appointmentStatus)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // confirm cho khach hang
    @Override
    public AppointmentDto confirmForCustomer(Integer appointmentId, Integer staffId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn với ID: " + appointmentId));
        User staff = userRepository.findById(staffId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Không tìm thấy nhân viên với username: " + staffId));

        // kiem tra neu appointment da bi huy
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new IllegalStateException("Không thể xác nhận lịch hẹn đã bị hủy.");
        }
        // if (appointment.getStatus() == AppointmentStatus.CONFIRMED) {
        // throw new IllegalStateException("Lịch hẹn đã được xác nhận từ trước.");
        // }

        // if (appointment.getStatus() == AppointmentStatus.CHECKED_IN) {
        // throw new IllegalStateException("Lịch hẹn đã được checked-in.");
        // }

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new IllegalStateException("Lịch hẹn đã được xác nhận.");
        }

        appointment.setStaff(staff);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        //
        Appointment savedAppointment = appointmentRepository.save(appointment);
        // === 5. PHẦN CODE MỚI THÊM VÀO (Gửi thông báo) ===
        NotificationRequest customerNoti = new NotificationRequest();
        customerNoti.setUserId(savedAppointment.getCustomer().getUserId()); // ID người nhận (Khách hàng)
        customerNoti.setTitle("Lịch hẹn của bạn đã được xác nhận!");
        customerNoti.setMessage("Lịch hẹn #" + savedAppointment.getAppointmentId() +
                " đã được nhân viên xác nhận. Vui lòng đến quầy và check-in lúc " +
                savedAppointment.getAppointmentTime() + " ngày " + savedAppointment.getAppointmentDate() + ".");

        notificationService.createNotification(customerNoti); // Gửi đi

        // có tech và staff
        return toDto(appointmentRepository.save(appointment));
    }

    // checkin cho customer
    @Override
    public AppointmentDto checkInAppointment(Integer appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn với ID: " + appointmentId));

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException("Chỉ có thể check-in khi lịch hẹn đã được xác nhận.");
        }

        appointment.setStatus(AppointmentStatus.CHECKED_IN);
        appointment.setUpdatedAt(LocalDateTime.now());

        return toDto(appointmentRepository.save(appointment));
    }

    // lay danh sach tech goi y cho lich hen theo certificate
    @Override
    public List<TechnicianWithCertificateDto> getSuggestedTechniciansForAppointment(Integer appointmentId) {
        // 1. Lấy appointment + kiểm tra trạng thái
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn ID: " + appointmentId));

        if (appointment.getStatus() != AppointmentStatus.CHECKED_IN) {
            throw new IllegalStateException("Chỉ có thể gợi ý kỹ thuật viên khi lịch hẹn đã check-in.");
        }

        // 2. Xác định loại chứng chỉ cần
        Vehicle vehicle = appointment.getVehicle();
        CertificateType requiredType = switch (vehicle.getVehicleType()) {
            case ELECTRIC_CAR -> CertificateType.ELECTRIC_CAR_REPAIR;
            case ELECTRIC_MOTORBIKE -> CertificateType.ELECTRIC_MOTORBIKE_REPAIR;
            default -> throw new IllegalArgumentException("Loại xe không hỗ trợ: " + vehicle.getVehicleType());
        };

        // 3. Lấy chứng chỉ còn hạn
        LocalDate today = LocalDate.now();
        List<TechnicianCertificate> validCerts = technicianCertificateRepository
                .findByCertificate_CertificateTypeAndExpiryDateAfter(requiredType, today);

        // 4. Nhóm KTV + lấy hạn xa nhất (dùng Map + merge)
        Map<User, LocalDate> techExpiryMap = new HashMap<>();
        for (TechnicianCertificate tc : validCerts) {
            User tech = tc.getTechnician();
            LocalDate expiry = tc.getExpiryDate();
            techExpiryMap.merge(tech, expiry, (old, newE) -> old.isAfter(newE) ? old : newE);
        }

        // 5. Chuyển thành DTO
        List<TechnicianWithCertificateDto> result = new ArrayList<>();
        for (Map.Entry<User, LocalDate> e : techExpiryMap.entrySet()) {
            User tech = e.getKey();
            result.add(TechnicianWithCertificateDto.builder()
                    .userId(tech.getUserId())
                    .fullName(tech.getFullName())
                    .phoneNumber(tech.getPhoneNumber())
                    .expiryDate(e.getValue())
                    .build());
        }

        // 6. Sắp xếp theo hạn xa trước
        result.sort(Comparator.comparing(
                TechnicianWithCertificateDto::getExpiryDate,
                Comparator.nullsLast(Comparator.reverseOrder())));

        return result;
    }

    // giao lich cho technician
    @Override
    public AppointmentDto assignTechnician(Integer appointmentId, Integer technicianId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn với ID: " + appointmentId));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Không tìm thấy kỹ thuật viên với ID: " + technicianId));

        // Kiểm tra KTV có chứng chỉ phù hợp với loại xe không
        List<TechnicianWithCertificateDto> suggested = getSuggestedTechniciansForAppointment(appointmentId);
        boolean isQualified = suggested.stream().anyMatch(t -> t.getUserId().equals(technicianId));

        if (!isQualified) {
            throw new IllegalArgumentException(
                    "Nhiệm vụ không thành công: Kỹ thuật viên được chọn không có chứng chỉ phù hợp để bảo dưỡng loại xe này");
        }

        // Kiểm tra KTV có đang bận (có lịch IN_PROGRESS trong ngày) không
        List<Appointment> inProgressAppointments = appointmentRepository
                .findByAssignedTechnician_UserIdAndStatus(technicianId, AppointmentStatus.IN_PROGRESS);

        if (!inProgressAppointments.isEmpty()) {
            throw new IllegalStateException(
                    "Kỹ thuật viên đang thực hiện một công việc khác (IN_PROGRESS).");
        }

        // kiem tra so lich duoc giao trong ngay gioi han la 3
        boolean isBusy = appointmentRepository
                .findByAssignedTechnician_UserIdAndAppointmentDate(technicianId, appointment.getAppointmentDate())
                .size() > 3;
        if (isBusy) {
            throw new IllegalStateException("Kỹ thuật viên đã nhận tối đa 3 lịch hẹn trong ngày.");
        }

        // kiem tra appointment da checked-in
        if (appointment.getStatus() != AppointmentStatus.CHECKED_IN) {
            throw new IllegalStateException("Chỉ có thể giao việc cho kỹ thuật viên khi khách đã check-in.");
        }

        appointment.setAssignedTechnician(technician);
        appointment.setStatus(AppointmentStatus.ASSIGNED);
        // gui thong bao cho tech khi đc giao việc
        Appointment savedAppointment = appointmentRepository.save(appointment);
        NotificationRequest techNoti = new NotificationRequest();
        techNoti.setUserId(technicianId);
        techNoti.setTitle("Bạn có cuộc hẹn mới!");
        techNoti.setMessage("Bạn vừa được gán lịch hẹn #" + savedAppointment.getAppointmentId() +
                " vào lúc " + savedAppointment.getAppointmentTime() + " ngày " + savedAppointment.getAppointmentDate());

        notificationService.createNotification(techNoti); // gui di
        return toDto(appointmentRepository.save(appointment));
    }

    @Override
    public List<AppointmentDto> getAppointmentByTechnician(Integer technicianId, String statusStr) {
        User tech = userRepository.findById(technicianId)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Không tìm thấy kỹ thuật viên với id : " + technicianId));

        List<Appointment> appointments;

        if (statusStr != null && !statusStr.isEmpty() && !statusStr.equals("ALL")) {
            try {
                AppointmentStatus status = AppointmentStatus.valueOf(statusStr);
                appointments = appointmentRepository.findByAssignedTechnician_UserIdAndStatus(tech.getUserId(), status);
            } catch (IllegalArgumentException e) {
                appointments = List.of();
            }
        } else {
            appointments = appointmentRepository.findByAssignedTechnician_UserId(tech.getUserId());
        }

        return appointments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // dat lich hen cho customer
    @Override
    public AppointmentDto createAppointmentForCustomer(Integer username, AppointmentRequest request) {
        User customer = userRepository.findById(username)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Không tìm thấy khách hàng với username: " + username));

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Không tìm thấy xe với ID: " + request.getVehicleId()));

        ServiceCenter center = centerRepository.findById(request.getCenterId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy Trung tâm dịch vụ với ID: " + request.getCenterId()));

        // Security Check: Đảm bảo khách hàng chỉ đặt lịch cho xe của chính mình.
        if (!vehicle.getUser().getUserId().equals(customer.getUserId())) {
            throw new SecurityException("Bạn chỉ có thể đặt lịch cho xe của chính mình.");
        }

        // xu li contract
        CustomerPackageContract contract = null;
        if (request.getContractId() != null) {
            contract = contractRepository.findById(request.getContractId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy hợp đồng với ID: " + request.getContractId()));
            // kiem tra contract thuoc ve khach hang
            if (!contract.getUser().getUserId().equals(customer.getUserId())) {
                throw new SecurityException("Hợp đồng này không thuộc về bạn.");
            }
            // Business Rule: Kiểm tra contract còn hạn và active
            if (contract.getStatus() != ContractStatus.ACTIVE || contract.getEndDate().isBefore(LocalDate.now())) {
                throw new IllegalStateException("Hợp đồng đã hết hạn hoặc không còn hiệu lực.");
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
    public AppointmentDto cancelAppointmentForCustomer(Integer appointmentId, Integer customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Không tìm thấy khách hàng với username: " + customerId));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn với ID: " + appointmentId));

        // Security Check: Đảm bảo khách hàng chỉ hủy lịch hẹn của chính mình.
        if (!appointment.getCustomer().getUserId().equals(customer.getUserId())) {
            throw new SecurityException("Bạn không được phép hủy lịch hẹn này.");
        }

        // Business Rule Check: Chỉ cho phép hủy khi đang PENDING hoặc CONFIRMED.
        if (appointment.getStatus() != AppointmentStatus.PENDING
                && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Cuộc hẹn không thể bị hủy khi ở trạng thái " + appointment.getStatus());
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setNote(appointment.getNote() + " [Đã hủy bởi khách hàng]");
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
                .phoneNumber(a.getCustomer().getPhoneNumber())
                .staffId(a.getStaff() != null ? a.getStaff().getUserId() : null)
                .staffName(a.getStaff() != null ? a.getStaff().getFullName() : null)
                .technicianId(a.getAssignedTechnician() != null ? a.getAssignedTechnician().getUserId() : null)
                .technicianName(a.getAssignedTechnician() != null ? a.getAssignedTechnician().getFullName() : null)
                .vehicleId(a.getVehicle().getVehicleId())
                .centerId(a.getCenter().getCenterId())
                .contractId(a.getContract() != null ? a.getContract().getContractId() : null)
                .contractName(a.getContract() != null ? a.getContract().getContractName() : null)
                .ticketId(a.getServiceTicket() != null ? a.getServiceTicket().getTicketId() : null)
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }

}