package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.ServiceTicketDto;
import edu.uth.evservice.EVService.model.*;
import edu.uth.evservice.EVService.repositories.*;
import edu.uth.evservice.EVService.requests.ServiceTicketRequest;
import edu.uth.evservice.EVService.services.IServiceTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ServiceTicketServiceImpl implements IServiceTicketService {

    private final IServiceTicketRepository ticketRepo;
    private final IAppointmentRepository appointmentRepo;
    private final IUserRepository userRepo;
    // BỔ SUNG HAI REPOSITORY CÒN THIẾU
    private final ITicketServiceItemRepository ticketServiceItemRepository;
    private final ITicketPartRepository ticketPartRepository;

    @Override
    public List<ServiceTicketDto> getAllTickets() {
        return ticketRepo.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceTicketDto getTicketById(Integer id) {
        return ticketRepo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

//    @Override
//    public ServiceTicketDto createTicket(ServiceTicketRequest request) {
//        Appointment appointment = appointmentRepo.findById(request.getAppointmentId())
//                .orElseThrow(() -> new RuntimeException("Appointment not found"));
//
//        User technician = userRepo.findById(request.getTechnicianId())
//                .orElseThrow(() -> new RuntimeException("Technician not found"));
//
//        ServiceTicket ticket = ServiceTicket.builder()
//                .appointment(appointment)
//                .technician(technician)
//                .startTime(request.getStartTime())
//                .endTime(request.getEndTime())
//                .status(request.getStatus())
//                .notes(request.getNotes())
//                .build();
//
//        return toDto(ticketRepo.save(ticket));
//    }
@Override
public ServiceTicketDto createTicket(ServiceTicketRequest request) {
    // 1. Tìm lịch hẹn dựa trên appointmentId từ request. Đây là việc bắt buộc.
    Appointment appointment = appointmentRepo.findById(request.getAppointmentId())
            .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + request.getAppointmentId()));

    // 2. XÂY DỰNG PHIẾU DỊCH VỤ MÀ KHÔNG CẦN KỸ THUẬT VIÊN
    ServiceTicket ticket = ServiceTicket.builder()
            .appointment(appointment) // Gán lịch hẹn đã tìm thấy
            .status(request.getStatus())
            .notes(request.getNotes())
            // Không cần startTime, endTime, hoặc technician ở bước này
            .build();

    // 3. Lưu phiếu mới vào database
    ServiceTicket savedTicket = ticketRepo.save(ticket);

    // 4. Trả về DTO của phiếu vừa tạo
    return toDto(savedTicket);
}

    @Override
    public ServiceTicketDto updateTicket(Integer id, ServiceTicketRequest request) {
        ServiceTicket ticket = ticketRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStartTime(request.getStartTime());
        ticket.setEndTime(request.getEndTime());
        ticket.setStatus(request.getStatus());
        ticket.setNotes(request.getNotes());
        // === LOGIC PHÂN CÔNG KỸ THUẬT VIÊN (PHẦN THÊM VÀO) ===
        if(request.getTechnicianId() != null) {
            User technician = userRepo.findById(request.getTechnicianId())
                    .orElseThrow(() -> new RuntimeException("Technician not found with id " + request.getTechnicianId()));
            ticket.setTechnician(technician);
        }
        ServiceTicket updatedTicket = ticketRepo.save(ticket);

        return toDto(ticketRepo.save(ticket));
    }

    @Override
    public void deleteTicket(Integer id) {
        ticketRepo.deleteById(id);
    }

//    private ServiceTicketDto toDto(ServiceTicket ticket) {
//        return ServiceTicketDto.builder()
//                .ticketId(ticket.getTicketId())
//                .startTime(ticket.getStartTime())
//                .endTime(ticket.getEndTime())
//                .status(ticket.getStatus())
//                .notes(ticket.getNotes())
//                .appointmentId(ticket.getAppointment().getAppointmentId())
//                .technicianId(ticket.getTechnician().getUserId())
//                .build();
//    }
private ServiceTicketDto toDto(ServiceTicket ticket) {
    // === PHẦN SỬA LỖI ===
    // 1. Kiểm tra xem phiếu này đã có kỹ thuật viên chưa
    Integer techId = null;
    if (ticket.getTechnician() != null) {
        // 2. Nếu có, thì mới lấy ID
        techId = ticket.getTechnician().getUserId();
    }

    // 3. Xây dựng DTO với techId có thể là null
    return ServiceTicketDto.builder()
            .ticketId(ticket.getTicketId())
            .startTime(ticket.getStartTime())
            .endTime(ticket.getEndTime())
            .status(ticket.getStatus())
            .notes(ticket.getNotes())
            .appointmentId(ticket.getAppointment().getAppointmentId())
            .technicianId(techId) // <-- Sử dụng biến techId an toàn
            .build();
}
//Quản lý Hàng chờ
@Override
    public List<ServiceTicketDto> getTicketsByStatus(String status) {
        // goi repository
    List<ServiceTicket> tickets = ticketRepo.findByStatus(status);
    // chuyen doi danh sach E sang Dto
    return tickets.stream().map(this::toDto).collect(Collectors.toList());
}
    @Override
    public BigDecimal calculateTotalAmount(Integer ticketId) {
        BigDecimal totalAmount = BigDecimal.ZERO;

        // Tính tổng tiền dịch vụ
        List<TicketServiceItem> serviceItems = ticketServiceItemRepository.findByServiceTicket_TicketId(ticketId);
        for (TicketServiceItem item : serviceItems) {
            totalAmount = totalAmount.add(BigDecimal.valueOf(item.getUnitPriceAtTimeOfService() * item.getQuantity()));
        }

        // Tính tổng tiền phụ tùng
        // Tính tổng tiền phụ tùng
        List<TicketPart> parts = ticketPartRepository.findByTicket_TicketId(ticketId);
        for (TicketPart part : parts) {
            BigDecimal partTotal = BigDecimal.valueOf(part.getUnitPriceAtTimeOfService() * part.getQuantity());
            totalAmount = totalAmount.add(partTotal);
        }

        return totalAmount;
    }
}
