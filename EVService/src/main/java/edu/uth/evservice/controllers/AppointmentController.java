package edu.uth.evservice.controllers;

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

import edu.uth.evservice.dtos.AppointmentDto;
import edu.uth.evservice.dtos.TechnicianWithCertificateDto;
import edu.uth.evservice.requests.AppointmentRequest;
import edu.uth.evservice.requests.AssignTechnicianRequest;
import edu.uth.evservice.services.IAppointmentService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

        private final IAppointmentService appointmentService;

        // Customer lay danh sach lich hen cua minh
        @GetMapping("/myAppointments")
        @PreAuthorize("hasAnyRole('CUSTOMER')")
        public ResponseEntity<List<AppointmentDto>> getMyAppointments(Authentication authentication) {
                Integer customerId = Integer.parseInt(authentication.getName());
                List<AppointmentDto> myAppointments = appointmentService.getByCustomer(customerId);
                return ResponseEntity.ok(myAppointments);
        }

        // lay danh sach lich hen theo trang thai (admin/staff)
        @GetMapping("/status/{status}")
        @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
        public ResponseEntity<List<AppointmentDto>> getAppointmentsByStatus(@PathVariable String status) {

                return ResponseEntity.ok(appointmentService.getAppointmentsByStatus(status));
        }

        // Customer create appointment
        @PostMapping
        @PreAuthorize("hasAnyRole('CUSTOMER')")
        public ResponseEntity<AppointmentDto> createMyAppointment(
                        @RequestBody AppointmentRequest request,
                        Authentication authentication) {

                Integer customerId = Integer.parseInt(authentication.getName());

                AppointmentDto newAppointment = appointmentService.createAppointmentForCustomer(
                                customerId,
                                request);
                return new ResponseEntity<>(newAppointment, HttpStatus.CREATED);
        }

        // Customer cancel appointment
        @DeleteMapping("/{appointmentId}")
        @PreAuthorize("hasAnyRole('CUSTOMER')")
        public ResponseEntity<AppointmentDto> cancelMyAppointment(
                        @PathVariable Integer appointmentId,
                        Authentication authentication) {
                Integer customerId = Integer.parseInt(authentication.getName());
                AppointmentDto canceledAppointment = appointmentService.cancelAppointmentForCustomer(appointmentId,
                                customerId);
                return ResponseEntity.ok(canceledAppointment);
        }

        // Staff xac nhan lich hen
        @PutMapping("/{appointmentId}/confirmForCustomer")
        @PreAuthorize("hasAnyRole('STAFF')")
        public ResponseEntity<AppointmentDto> confirmForCustomer(@PathVariable Integer appointmentId,
                        Authentication authentication) {
                Integer staffId = Integer.parseInt(authentication.getName());
                AppointmentDto updatedAppointment = appointmentService.confirmForCustomer(appointmentId, staffId);
                return ResponseEntity.ok(updatedAppointment);
        }

        // check-in lịch hen cho customer
        @PutMapping("/{appointmentId}/check-in")
        @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
        public ResponseEntity<AppointmentDto> checkIn(@PathVariable Integer appointmentId) {
                AppointmentDto result = appointmentService.checkInAppointment(appointmentId);

                return ResponseEntity.ok(result);
        }

        // Lấy danh sách kỹ thuật viên gợi ý cho lịch hẹn
        @GetMapping("/{appointmentId}/suggestedTechnicians")
        @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
        public ResponseEntity<List<TechnicianWithCertificateDto>> getSuggestedTechniciansForAppointment(
                        @PathVariable Integer appointmentId) {
                List<TechnicianWithCertificateDto> suggestedTechnicians = appointmentService
                                .getSuggestedTechniciansForAppointment(appointmentId);
                return ResponseEntity.ok(suggestedTechnicians);
        }

        // phan cong lich hen cho technician
        @PutMapping("/{appointmentId}/assignTechnician")
        @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
        public ResponseEntity<AppointmentDto> assignTechnician(
                        @PathVariable Integer appointmentId,
                        @RequestBody AssignTechnicianRequest request) {
                AppointmentDto updatedAppointment = appointmentService.assignTechnician(appointmentId,
                                request.getTechnicianId());
                return ResponseEntity.ok(updatedAppointment);
        }

        // KTV xem danh sách LỊCH HẸN (chưa phải công việc) được gán
        @GetMapping("/technician")
        @PreAuthorize("hasRole('TECHNICIAN')")
        public ResponseEntity<List<AppointmentDto>> getApointmentsByTechnician(Authentication authentication) {
                Integer technicianId = Integer.parseInt(authentication.getName());
                List<AppointmentDto> appointments = appointmentService
                                .getAppointmentByTechinician(technicianId);
                return ResponseEntity.ok(appointments);
        }

}