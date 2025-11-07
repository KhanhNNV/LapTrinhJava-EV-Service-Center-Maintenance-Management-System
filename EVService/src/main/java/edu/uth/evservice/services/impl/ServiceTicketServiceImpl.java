package edu.uth.evservice.services.impl;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import edu.uth.evservice.dtos.*;
import edu.uth.evservice.exception.ResourceNotFoundException;
import edu.uth.evservice.models.*;
import edu.uth.evservice.repositories.*;
import edu.uth.evservice.requests.AddServiceItemRequest;
import edu.uth.evservice.requests.UpdatePartQuantityRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.uth.evservice.models.enums.AppointmentStatus;
import edu.uth.evservice.models.enums.ServiceTicketStatus;
import edu.uth.evservice.requests.ServiceTicketRequest;
import edu.uth.evservice.services.IServiceTicketService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ServiceTicketServiceImpl implements IServiceTicketService {

    private final IServiceTicketRepository ticketRepo;
    private final IAppointmentRepository appointmentRepo;
    private final IUserRepository userRepo;

    private final ITicketServiceItemRepository ticketServiceItemRepository;
    private final IServiceItemRepository serviceItemRepo;
    private final IPartRepository partRepo;
    private final IInventoryRepository inventoryRepo;
    private final ITicketPartRepository ticketPartRepo;
    private final IServiceItemPartRepository suggestionRepo;

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

    @Override
    public ServiceTicketDto createTicket(ServiceTicketRequest request) {
        Appointment appointment = appointmentRepo.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        User technician = userRepo.findById(request.getTechnicianId())
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        ServiceTicket ticket = ServiceTicket.builder()
                .appointment(appointment)
                .technician(technician)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(ServiceTicketStatus.valueOf(request.getStatus()))
                .notes(request.getNotes())
                .build();

        return toDto(ticketRepo.save(ticket));
    }

    @Override
    public ServiceTicketDto updateTicket(Integer id, ServiceTicketRequest request) {
        ServiceTicket ticket = ticketRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStartTime(request.getStartTime());
        ticket.setEndTime(request.getEndTime());
        ticket.setStatus(ServiceTicketStatus.valueOf(request.getStatus()));
        ticket.setNotes(request.getNotes());

        return toDto(ticketRepo.save(ticket));
    }

    @Override
    public void deleteTicket(Integer id) {
        ticketRepo.deleteById(id);
    }

    // --- LOGIC MỚI CHO WORKFLOW ---

    // tech tao ticket tu appointment duoc giao
    @Override
    public ServiceTicketDto createTicketFromAppointment(Integer appointmentId, String technicianUsername) {
        Appointment appointment = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found: " + appointmentId));

        if (appointment.getStatus() != AppointmentStatus.ASSIGNED) {
            throw new IllegalStateException("Cannot create service ticket. Customer has not checked in yet.");
        }
        if (appointment.getServiceTickets() != null) {
            throw new IllegalStateException("A service ticket has already been created for this appointment.");
        }
        if (!appointment.getAssignedTechnician().getUsername().equals(technicianUsername)) {
            throw new SecurityException("You are not assigned to this appointment.");
        }

        ServiceTicket ticket = ServiceTicket.builder()
                .appointment(appointment)
                .technician(appointment.getAssignedTechnician())
                .startTime(LocalDateTime.now())
                .status(ServiceTicketStatus.IN_PROGRESS)
                .notes(appointment.getNote())
                .build();
        appointment.setStatus(AppointmentStatus.IN_PROGRESS);
        ServiceTicket savedTicket = ticketRepo.save(ticket);

        // --- LOGIC MỚI: TỰ ĐỘNG THÊM SERVICE ITEMS NẾU CÓ CONTRACT ---
        // if (appointment.getContract() != null) {
        // ServicePackage servicePackage =
        // appointment.getContract().getServicePackage();
        // // Giả sử ServicePackage có một list các ServiceItem
        // // Cần thêm mối quan hệ @ManyToMany giữa ServicePackage và ServiceItem
        // List<ServiceItem> itemsInPackage = servicePackage.getServiceItems();

        // for (ServiceItem item : itemsInPackage) {
        // TicketServiceItem tsi = TicketServiceItem.builder()
        // .id(new TicketServiceItemId(savedTicket.getTicketId(), item.getItemId()))
        // .serviceTicket(savedTicket)
        // .serviceItem(item)
        // .quantity(1)
        // .unitPriceAtTimeOfService(0.0) // Miễn phí vì nằm trong gói
        // .build();
        // ticketServiceItemRepository.save(tsi);
        // }
        // }

        return toDto(savedTicket);
    }

    @Override
    public ServiceTicketDto completeWorkOnTicket(Integer ticketId, String username) {
        verifyTicketOwnership(username, ticketId);
        ServiceTicket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Service Ticket not found"));

        if (ticket.getEndTime() != null) {
            throw new IllegalStateException("Work on this ticket has already been completed.");
        }

        ticket.setEndTime(LocalDateTime.now());
        ticket.setStatus(ServiceTicketStatus.COMPLETED);

        // Cập nhật cả Appointment liên quan
        ticket.getAppointment().setStatus(AppointmentStatus.COMPLETED);

        return toDto(ticketRepo.save(ticket));
    }

    // kiem tra quyen so huu ticket cua tech
    @Override
    public void verifyTicketOwnership(String username, Integer ticketId) {
        User technician = userRepo.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Technician not found: " + username));
        ServiceTicket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Service Ticket not found: " + ticketId));

        if (!ticket.getTechnician().getUserId().equals(technician.getUserId())) {
            throw new SecurityException("Access Denied: You do not own this service ticket.");
        }
    }

    @Override
    public List<ServiceTicketDto> getTicketsByTechnicianId(Integer technicianId) {
        return ticketRepo.findByTechnician_UserId(technicianId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // cap nhat ticket status
    @Override
    public ServiceTicketDto updateTicketStatus(Integer ticketId, String username, ServiceTicketStatus newStatus) {
        verifyTicketOwnership(username, ticketId);
        ServiceTicket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Service Ticket not found"));
        ticket.setStatus(newStatus);
        return toDto(ticketRepo.save(ticket));
    }

    @Override
    public ServiceTicketDto updateTicketNotes(Integer ticketId, String username, String newNotes) {
        verifyTicketOwnership(username, ticketId);
        ServiceTicket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Service Ticket not found"));
        ticket.setNotes(newNotes);
        return toDto(ticketRepo.save(ticket));
    }
    @Override
    public SuggestedPartsDto addServiceItemToTicket(Integer ticketId, AddServiceItemRequest request, String username) {
        ServiceTicket ticket = getTicketAndVerifyStatus(ticketId, username);

        ServiceItem item = serviceItemRepo.findById(request.getItemId()).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hạng mục dịch vụ này"));

        if(ticketServiceItemRepository.existsById(new TicketServiceItemId(ticketId,request.getItemId()))) {
            throw new IllegalStateException("Hạng mục dịch vụ này đã tồn tại");
        }

        //Tạo TicketServiceItem
        TicketServiceItem ticketServiceItem = TicketServiceItem.builder()
                .id(new TicketServiceItemId(ticketId,request.getItemId()))
                .serviceTicket(ticket)
                .serviceItem(item)
                .quantity(request.getQuantity())
                .unitPriceAtTimeOfService(item.getPrice())
                .build();

        TicketServiceItem savedTicketServiceItem = ticketServiceItemRepository.save(ticketServiceItem);
        TicketServiceItemDto ticketServiceItemDto = toDto(savedTicketServiceItem);

        // Lấy danh sách gợi ý
        List<ServiceItemPart> suggestions = suggestionRepo.findByServiceItem_ItemId(request.getItemId());

        List<ServiceTicketPartDto> suggestedParts = suggestions.stream()
                .map(suggestion ->{
                    Part part = suggestion.getPart();

                    int suggestedQty = suggestion.getQuantity();

                    //Lấy tồn kho
                    int stock = inventoryRepo.findByPart_PartId(part.getPartId())
                            .map(Inventory::getQuantity).orElse(0L).intValue();
                    return toSuggestedDto(part, suggestedQty, stock);
                }).collect(Collectors.toList());

        // Trả về DTO gợi ý danh sách phụ tùng cho item đó
        return SuggestedPartsDto.builder()
                .serviceItemAdded(ticketServiceItemDto)
                .suggestedParts(suggestedParts)
                .build();
    }

    @Override
    public void removeServiceItemFromTicket(Integer ticketId, Integer itemId, String username) {
        getTicketAndVerifyStatus(ticketId, username);

        TicketServiceItemId id = new TicketServiceItemId(ticketId, itemId);
        if (!ticketServiceItemRepository.existsById(id)) {
            throw new EntityNotFoundException("Hạng mục dịch vụ này không tìm thấy trên phiếu.");
        }

        ticketServiceItemRepository.deleteById(id);
    }


    /**
     * Cập nhật số lượng của một Part trên Ticket nếu tech ko muốn lấy số lượng như gợi ý.
     * 1. Lấy số lượng Tech muốn (newQuantity)
     * 2. Lấy số lượng đang có trên ticket (currentQuantity)
     * 3. Tính chênh lệch (delta = newQuantity - currentQuantity)
     * 4. Kiểm tra kho xem có đủ cho (delta) không
     * 5. Cập nhật kho (trừ hoặc cộng trả lại kho)
     * 6. Cập nhật bảng TicketPart
     */
    @Override
    public TicketPartDto updatePartOnTicket(Integer ticketId, UpdatePartQuantityRequest request, String username) {
        // 1. Xác thực và lấy ticket
        ServiceTicket ticket = getTicketAndVerifyStatus(ticketId, username);

        Part part = partRepo.findById(request.getPartId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phụ tùng"));

        int newQuantity = request.getQuantity();
        if (newQuantity < 0) {
            throw new IllegalArgumentException("Số lượng không thể âm.");
        }

        TicketPartId id = new TicketPartId(ticketId, request.getPartId());

        // 2. Lấy số lượng hiện tại
        int currentQuantity = ticketPartRepo.findById(id)
                .map(TicketPart::getQuantity)
                .orElse(0);

        // 3. Tính toán chênh lệch (delta)
        int delta = newQuantity - currentQuantity;

        if (delta == 0 && currentQuantity == 0) {
            throw new IllegalStateException("Không thể cập nhật số lượng từ 0 đến 0.");
        }

        if (delta == 0) {
            // Không có gì thay đổi, trả về DTO hiện tại
            return toDto(ticketPartRepo.findById(id).get());
        }

        // 4. Xử lý KHO (Inventory)
        Inventory inventory = inventoryRepo.findByPart_PartId(request.getPartId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hàng tồn kho cho phụ tùng này"));

        if (delta > 0) {
            // Cần lấy THÊM hàng
            if (inventory.getQuantity() < delta) {
                throw new IllegalStateException("Không đủ hàng cho phụ tùng này: " + part.getPartName() +
                        ". Yêu cầu: " + delta +
                        ", Có sẵn: " + inventory.getQuantity());
            }
        }

        // 5. Cập nhật kho (delta có thể âm, nghĩa là trả hàng vào kho)
        inventory.setQuantity(inventory.getQuantity() - delta);
        inventoryRepo.save(inventory);

        // 6. Cập nhật TicketPart
        if (newQuantity == 0) {
            // Xóa khỏi ticket
            if (currentQuantity > 0) { // Chỉ xóa nếu nó thực sự tồn tại
                ticketPartRepo.deleteById(id);
            }
            // Trả về DTO với số lượng 0
            return buildZeroQuantityPartDto(part);
        } else {
            // Cập nhật hoặc tạo mới
            TicketPart ticketPart = ticketPartRepo.findById(id)
                    .orElseGet(() -> TicketPart.builder() // Tạo mới nếu chưa có
                            .id(id)
                            .ticket(ticket)
                            .part(part)
                            .unitPriceAtTimeOfService(part.getUnitPrice())
                            .build());

            ticketPart.setQuantity(newQuantity);
            TicketPart savedTp = ticketPartRepo.save(ticketPart);
            return toDto(savedTp);
        }
    }



    //Lấy ticket và kiểm tra trạng thái, nếu là in progress mới được thêm item và part
    private ServiceTicket getTicketAndVerifyStatus(Integer ticketId, String username) {
        verifyTicketOwnership(username, ticketId);
        ServiceTicket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy phiếu dịch vụ: " + ticketId));

        if (ticket.getStatus() != ServiceTicketStatus.IN_PROGRESS) {
            throw new IllegalStateException("Phiếu không được IN_PROGRESS. Không thể sửa đổi.");
        }
        return ticket;
    }



    // --- Các hàm DTO ---

    private ServiceTicketDto toDto(ServiceTicket ticket) {
        if (ticket == null)
            return null;
        return ServiceTicketDto.builder()
                .ticketId(ticket.getTicketId())
                .startTime(ticket.getStartTime())
                .endTime(ticket.getEndTime())
                .status(ticket.getStatus() != null ? ticket.getStatus().name() : null)
                .notes(ticket.getNotes())
                .appointmentId(ticket.getAppointment().getAppointmentId())
                .technicianId(ticket.getTechnician().getUserId())
                .build();
    }

    private TicketServiceItemDto toDto(TicketServiceItem tsi) {
        return TicketServiceItemDto.builder()
                .itemId(tsi.getServiceItem().getItemId())
                .itemName(tsi.getServiceItem().getItemName())
                .quantity(tsi.getQuantity())
                .unitPriceAtTimeOfService(tsi.getUnitPriceAtTimeOfService())
                .lineTotal(tsi.getQuantity() * tsi.getUnitPriceAtTimeOfService())
                .build();
    }

    private TicketPartDto toDto(TicketPart tp) {
        return TicketPartDto.builder()
                .partId(tp.getPart().getPartId())
                .partName(tp.getPart().getPartName())
                .quantity(tp.getQuantity())
                .unitPriceAtTimeOfService(tp.getUnitPriceAtTimeOfService())
                .lineTotal(tp.getQuantity() * tp.getUnitPriceAtTimeOfService())
                .build();
    }

    private ServiceTicketPartDto toSuggestedDto(Part part, int suggestedQty, int stock) {
        return ServiceTicketPartDto.builder()
                .partId(part.getPartId())
                .partName(part.getPartName())
                .unitPrice(part.getUnitPrice())
                .suggestedQuantity(suggestedQty) // Gán số lượng gợi ý
                .quantityInStock(stock) // Gán số lượng tồn kho
                .build();
    }

    private TicketPartDto buildZeroQuantityPartDto(Part part) {
        return TicketPartDto.builder()
                .partId(part.getPartId())
                .partName(part.getPartName())
                .quantity(0)
                .unitPriceAtTimeOfService(part.getUnitPrice()) // Giá tại thời điểm
                .lineTotal(0)
                .build();
    }

    @Override
    public List<TechnicianPerformanceDto> calculateTechnicianPerformance(LocalDateTime startDate, LocalDateTime endDate) {
        // Lấy các ticket đã hoàn thành trong khoảng thời gian
        List<ServiceTicket> completedTickets =
                ticketRepo.findByStatusAndEndTimeBetween(ServiceTicketStatus.COMPLETED, startDate, endDate);

        // Gom nhóm theo kỹ thuật viên
        Map<User, List<ServiceTicket>> groupedByTechnician = completedTickets.stream()
                .filter(t -> t.getTechnician() != null)
                .collect(Collectors.groupingBy(ServiceTicket::getTechnician));

        // Tính toán hiệu suất cho từng kỹ thuật viên
        return groupedByTechnician.entrySet().stream()
                .map(entry -> {
                    User tech = entry.getKey();
                    List<ServiceTicket> tickets = entry.getValue();

                    long totalMinutes = tickets.stream()
                            .filter(t -> t.getStartTime() != null && t.getEndTime() != null)
                            .mapToLong(t -> Duration.between(t.getStartTime(), t.getEndTime()).toMinutes())
                            .sum();

                    long totalTickets = tickets.size();
                    double avgMinutes = totalTickets > 0 ? (double) totalMinutes / totalTickets : 0;

                    return TechnicianPerformanceDto.builder()
                            .technicianId(tech.getUserId())
                            .technicianName(tech.getFullName())
                            .totalTickets(totalTickets)
                            .totalMinutes(totalMinutes)
                            .avgMinutes(avgMinutes)
                            .build();
                })
                .sorted(Comparator.comparingLong(TechnicianPerformanceDto::getTotalTickets).reversed()) // sắp giảm dần theo số vé
                .collect(Collectors.toList());
    }
}
