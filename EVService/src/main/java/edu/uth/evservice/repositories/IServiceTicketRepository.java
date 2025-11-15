package edu.uth.evservice.repositories;

import edu.uth.evservice.models.ServiceTicket;
import edu.uth.evservice.models.enums.ServiceTicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IServiceTicketRepository extends JpaRepository<ServiceTicket, Integer> {

    List<ServiceTicket> findByStatusAndEndTimeBetween(ServiceTicketStatus status, LocalDateTime start, LocalDateTime end);

    // Sửa tên property từ serviceCenter thành center
    @Query("SELECT st FROM ServiceTicket st WHERE st.status = :status AND st.appointment.center.centerId = :centerId AND st.endTime BETWEEN :start AND :end")
    List<ServiceTicket> findByStatusAndAppointment_Center_CenterIdAndEndTimeBetween(
            @Param("status") ServiceTicketStatus status,
            @Param("centerId") Integer centerId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT st FROM ServiceTicket st WHERE st.appointment.center.centerId = :centerId AND st.endTime BETWEEN :start AND :end")
    List<ServiceTicket> findByAppointment_Center_CenterIdAndEndTimeBetween(
            @Param("centerId") Integer centerId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // Đếm số lượng tickets theo status
    long countByStatus(ServiceTicketStatus status);

    // Tìm tickets theo technician
    List<ServiceTicket> findByTechnician_UserId(Integer technicianId);
}