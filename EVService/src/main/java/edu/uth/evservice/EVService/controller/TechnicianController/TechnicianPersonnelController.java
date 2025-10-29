package edu.uth.evservice.EVService.controller.TechnicianController;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.uth.evservice.EVService.dto.AppointmentDto;
import edu.uth.evservice.EVService.dto.ServiceTicketDto;
import edu.uth.evservice.EVService.dto.TechnicianCertificateDto;
import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.requests.AddCertificateRequest;
import edu.uth.evservice.EVService.services.IAppointmentService;
import edu.uth.evservice.EVService.services.IServiceTicketService;
import edu.uth.evservice.EVService.services.ITechnicianCertificateService;
import edu.uth.evservice.EVService.services.IUserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/technician/personnel")
@RequiredArgsConstructor
public class TechnicianPersonnelController {

    private final IUserService userService;
    private final ITechnicianCertificateService techCertService;
    private final IAppointmentService appointmentService;
    private final IServiceTicketService ticketService;

    private User getCurrentTechnician(Authentication authentication) {
        return userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new EntityNotFoundException("Technician not found"));
    }

    /**
     * Xem lịch làm việc (các Appointment được gán) của tuần hiện tại.
     */
    @GetMapping("/schedule")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<AppointmentDto>> getWorkSchedule(Authentication authentication) {
        User currentTech = getCurrentTechnician(authentication);
        LocalDate startOfWeek = LocalDate.now().with(java.time.DayOfWeek.MONDAY);
        LocalDate endOfWeek = startOfWeek.plusDays(6);

        List<AppointmentDto> schedule = appointmentService
                .getConfirmedAppointmentsForTechnician(currentTech.getUserId());
        return ResponseEntity.ok(schedule);
    }

    /**
     * Xem "bảng chấm công" - là danh sách các công việc (ServiceTicket)
     * đã và đang thực hiện, dùng để tính toán thời gian làm việc.
     */
    @GetMapping("/timesheet")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<ServiceTicketDto>> getTimesheet(Authentication authentication) {
        User currentTech = getCurrentTechnician(authentication);
        List<ServiceTicketDto> workLogs = ticketService.getTicketsByTechnicianId(currentTech.getUserId());
        return ResponseEntity.ok(workLogs);
    }

    /**
     * Xem danh sách chứng chỉ chuyên môn của mình.
     */
    @GetMapping("/certificates")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<TechnicianCertificateDto>> getMyCertificates(Authentication authentication) {
        User currentTech = getCurrentTechnician(authentication);
        List<TechnicianCertificateDto> certificates = techCertService
                .getCertificatesForTechnician(currentTech.getUserId());
        return ResponseEntity.ok(certificates);
    }

    /**
     * Tự thêm một chứng chỉ mới cho bản thân.
     */
    @PostMapping("/certificates")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<TechnicianCertificateDto> addMyCertificate(
            @RequestBody AddCertificateRequest request,
            Authentication authentication) {
        User currentTech = getCurrentTechnician(authentication);
        TechnicianCertificateDto newCert = techCertService.addCertificateToTechnician(currentTech.getUserId(), request);
        return new ResponseEntity<>(newCert, HttpStatus.CREATED);
    }
}