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
import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.requests.AppointmentRequest;
import edu.uth.evservice.EVService.requests.AssignTechnicianRequest;
import edu.uth.evservice.EVService.services.IAppointmentService;
import edu.uth.evservice.EVService.services.IUserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

        private final IAppointmentService appointmentService;
        private final IUserService userService;

        // @GetMapping
        // public List<AppointmentDto> getAppointments() {
        // return appointmentService.getAllAppointments();
        // }
        //
        // @GetMapping("/{id}")
        // public AppointmentDto getAppointmentById(@PathVariable int id) {
        // return appointmentService.getAppointmentById(id);
        // }
        //
        // @PostMapping
        // public AppointmentDto createAppointment(@RequestBody AppointmentRequest
        // request) {
        // return appointmentService.createAppointment(request);
        // }

        @PutMapping("/{id}")
        public AppointmentDto updateAppointment(@PathVariable int id, @RequestBody AppointmentRequest request) {
                return appointmentService.updateAppointment(id, request);
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteAppointment(@PathVariable int id) {
                appointmentService.deleteAppointment(id);
                return ResponseEntity.ok().build();
        }

        // Customer create appointment
        @PostMapping("/customer/create")
        @PreAuthorize("hasAnyRole('CUSTOMER')")
        public ResponseEntity<AppointmentDto> createMyAppointment(
                        @RequestBody AppointmentRequest request,
                        Authentication authentication) {
                AppointmentDto newAppointment = appointmentService.createAppointmentForCustomer(
                                authentication.getName(),
                                request);
                return new ResponseEntity<>(newAppointment, HttpStatus.CREATED);
        }

        // Customer cancel appointment
        @DeleteMapping("/customer/{appointmentId}/cancel")
        @PreAuthorize("hasAnyRole('CUSTOMER')")
        public ResponseEntity<AppointmentDto> cancelMyAppointment(
                        @PathVariable Integer appointmentId,
                        Authentication authentication) {
                AppointmentDto canceledAppointment = appointmentService.cancelAppointmentForCustomer(appointmentId,
                                authentication.getName());
                return ResponseEntity.ok(canceledAppointment);
        }

        /**
         * Bước 2: Staff gán KTV và xác nhận lịch hẹn.
         */
        @PutMapping("/{appointmentId}/assign-and-confirm")
        @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
        public ResponseEntity<AppointmentDto> assignAndConfirm(
                        @PathVariable Integer appointmentId,
                        @RequestBody AssignTechnicianRequest request,
                        Authentication authentication) {
                String staffEmail = authentication.getName();
                AppointmentDto updatedAppointment = appointmentService.assignTechnicianAndConfirm(appointmentId,
                                request.getTechnicianId(), staffEmail);
                return ResponseEntity.ok(updatedAppointment);
        }

        /**
         * Bước 3: KTV xem danh sách LỊCH HẸN (chưa phải công việc) đã được gán cho
         * mình.
         */
        @GetMapping("/technician/appointment")
        @PreAuthorize("hasRole('TECHNICIAN')")
        public ResponseEntity<List<AppointmentDto>> getApointmentsByTechnicianId(Authentication authentication) {
                User currentTech = userService.findByUsername(authentication.getName())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Technician not found with username: " + authentication.getName()));
                List<AppointmentDto> appointments = appointmentService
                                .getAppointmentByTechinician(currentTech.getUserId());
                return ResponseEntity.ok(appointments);
        }

        /**
         * Bước 4: Tech check-in lịch.
         */
        @PutMapping("/{appointmentId}/check-in")
        @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'TECHNICIAN')")
        public ResponseEntity<AppointmentDto> checkIn(@PathVariable Integer appointmentId,
                        Authentication authentication) {
                User currentTech = userService.findByUsername(authentication.getName())
                                .orElseThrow(() -> new EntityNotFoundException("User not found"));
                boolean isAdmin = currentTech.getRole().name().equals("ADMIN");
                boolean isStaff = currentTech.getRole().name().equals("STAFF");

                AppointmentDto result = appointmentService.checkInAppointment(
                                appointmentId,
                                currentTech.getUserId(),
                                isAdmin || isStaff);

                return ResponseEntity.ok(result);
        }

}