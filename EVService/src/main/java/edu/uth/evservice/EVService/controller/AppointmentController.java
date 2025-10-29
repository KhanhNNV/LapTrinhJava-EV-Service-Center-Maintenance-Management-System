package edu.uth.evservice.EVService.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.uth.evservice.EVService.dto.AppointmentDto;
import edu.uth.evservice.EVService.requests.AppointmentRequest;
import edu.uth.evservice.EVService.services.IAppointmentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
class AssignTechnicianRequest {
    private Integer technicianId;
}

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final IAppointmentService appointmentService;

    @GetMapping
    public List<AppointmentDto> getAppointments() {
        return appointmentService.getAllAppointments();
    }

    @GetMapping("/{id}")
    public AppointmentDto getAppointmentById(@PathVariable int id) {
        return appointmentService.getAppointmentById(id);
    }

    @PostMapping
    public AppointmentDto createAppointment(@RequestBody AppointmentRequest request) {
        return appointmentService.createAppointment(request);
    }

    // Customer create appointment
    @PostMapping("/customer/create")
    @PreAuthorize("hasAnyRole('CUSTOMER')")
    public ResponseEntity<AppointmentDto> createMyAppointment(
            @RequestBody AppointmentRequest request,
            Authentication authentication) {
        AppointmentDto newAppointment = appointmentService.createAppointmentForCustomer(authentication.getName(),
                request);
        return new ResponseEntity<>(newAppointment, HttpStatus.CREATED);
    }

    // Customer cancel appointment
    @DeleteMapping("/{appointmentId}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER')")
    public ResponseEntity<AppointmentDto> cancelMyAppointment(
            @PathVariable Integer appointmentId,
            Authentication authentication) {
        AppointmentDto canceledAppointment = appointmentService.cancelAppointmentForCustomer(appointmentId,
                authentication.getName());
        return ResponseEntity.ok(canceledAppointment);
    }

    @PutMapping("/{id}")
    public AppointmentDto updateAppointment(@PathVariable int id, @RequestBody AppointmentRequest request) {
        return appointmentService.updateAppointment(id, request);
    }

    /**
     * Bước 2: Staff gán KTV và xác nhận lịch hẹn.
     */
    @PutMapping("/{appointmentId}/assign-and-confirm")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<AppointmentDto> assignAndConfirm(
            @PathVariable Integer appointmentId,
            @RequestBody AssignTechnicianRequest request) {
        AppointmentDto updatedAppointment = appointmentService.assignTechnicianAndConfirm(appointmentId,
                request.getTechnicianId());
        return ResponseEntity.ok(updatedAppointment);
    }

    /**
     * Bước 4: Staff (hoặc KTV) check-in cho khách.
     */
    @PutMapping("/{appointmentId}/check-in")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN', 'TECHNICIAN')")
    public ResponseEntity<AppointmentDto> checkIn(@PathVariable Integer appointmentId) {
        return ResponseEntity.ok(appointmentService.checkInAppointment(appointmentId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable int id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok().build();
    }

}