package edu.uth.evservice.EVService.repositories;

import edu.uth.evservice.EVService.model.ServiceTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository cho ServiceTicket
 * Lưu ý: tên interface bắt đầu với "I" theo requirement của bạn
 */
@Repository
public interface IServiceTicketRepository extends JpaRepository<ServiceTicket, Integer> {
    List<ServiceTicket> findByStatus(String status);

    // Nếu Employee có field employeeId, Spring Data sẽ parse được method này
    List<ServiceTicket> findByTechnicianEmployeeId(Integer technicianId);

    // Tìm theo appointment id
    List<ServiceTicket> findByAppointmentAppointmentId(Integer appointmentId);
}