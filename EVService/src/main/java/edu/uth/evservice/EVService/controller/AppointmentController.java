package edu.uth.evservice.EVService.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
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
import lombok.RequiredArgsConstructor;

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

    @PutMapping("/{id}")
    public AppointmentDto updateAppointment(@PathVariable int id, @RequestBody AppointmentRequest request) {
        return appointmentService.updateAppointment(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable int id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok().build();
    }

}
