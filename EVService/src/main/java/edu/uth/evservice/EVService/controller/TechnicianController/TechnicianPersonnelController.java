package edu.uth.evservice.EVService.controller.TechnicianController;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
     * 2.3.1 Xem phân công ca/lịch làm việc
     */
    @GetMapping("/schedule")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<AppointmentDto>> getWorkSchedule(Authentication authentication) {
        User currentTech = getCurrentTechnician(authentication);
        LocalDate startOfWeek = LocalDate.now().with(java.time.DayOfWeek.MONDAY);
        LocalDate endOfWeek = startOfWeek.plusDays(6);

        List<AppointmentDto> schedule = appointmentService.getSchedulesForTechnician(currentTech.getUserId(),
                startOfWeek, endOfWeek);
        return ResponseEntity.ok(schedule);
    }

    /**
     * 2.3.2 Theo dõi thời gian làm việc của bản thân (cham cong)
     * * Trả về danh sách các ServiceTicket đã làm trong tháng hiện tại
     */
    @GetMapping("/timesheet")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<ServiceTicketDto>> getTimesheet(Authentication authentication) {
        User currentTech = getCurrentTechnician(authentication);
        // Lấy các ticket của technician này
        List<ServiceTicketDto> workLogs = ticketService.getTicketsByTechnicianId(currentTech.getUserId());
        return ResponseEntity.ok(workLogs);
    }

    /**
     * Chức năng chấm công: Bắt đầu làm việc trên một ticket
     */
    @PutMapping("/timesheet/start/{ticketId}")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ServiceTicketDto> startWork(@PathVariable Integer ticketId, Authentication authentication) {
        ServiceTicketDto updatedTicket = ticketService.startWorkOnTicket(ticketId, authentication.getName());
        return ResponseEntity.ok(updatedTicket);
    }

    /**
     * Chức năng chấm công: Kết thúc công việc trên một ticket
     */
    @PutMapping("/timesheet/complete/{ticketId}")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ServiceTicketDto> completeWork(@PathVariable Integer ticketId,
            Authentication authentication) {
        ServiceTicketDto updatedTicket = ticketService.completeWorkOnTicket(ticketId, authentication.getName());
        return ResponseEntity.ok(updatedTicket);
    }

    /**
     * Xem các chứng chỉ chuyên môn EV của mình
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
     * Thêm một chứng chỉ mới cho bản thân
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
