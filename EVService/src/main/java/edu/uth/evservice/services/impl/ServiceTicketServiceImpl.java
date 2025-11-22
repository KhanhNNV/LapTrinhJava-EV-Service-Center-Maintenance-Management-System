package edu.uth.evservice.services.impl;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.uth.evservice.dtos.PerformanceDto;
import edu.uth.evservice.dtos.ServiceTicketDto;
import edu.uth.evservice.dtos.ServiceTicketPartDto;
import edu.uth.evservice.dtos.SuggestedPartsDto;
import edu.uth.evservice.dtos.TicketPartDto;
import edu.uth.evservice.dtos.TicketServiceItemDto;
import edu.uth.evservice.exception.ResourceNotFoundException;
import edu.uth.evservice.models.Appointment;
import edu.uth.evservice.models.CustomerPackageContract;
import edu.uth.evservice.models.Inventory;
import edu.uth.evservice.models.Part;
import edu.uth.evservice.models.ServiceCenter;
import edu.uth.evservice.models.ServiceItem;
import edu.uth.evservice.models.ServiceItemPart;
import edu.uth.evservice.models.ServicePackage;
import edu.uth.evservice.models.ServiceTicket;
import edu.uth.evservice.models.TicketPart;
import edu.uth.evservice.models.TicketPartId;
import edu.uth.evservice.models.TicketServiceItem;
import edu.uth.evservice.models.TicketServiceItemId;
import edu.uth.evservice.models.User;
import edu.uth.evservice.models.Vehicle;
import edu.uth.evservice.models.enums.AppointmentStatus;
import edu.uth.evservice.models.enums.Role;
import edu.uth.evservice.models.enums.ServiceTicketStatus;
import edu.uth.evservice.repositories.IAppointmentRepository;
import edu.uth.evservice.repositories.IInventoryRepository;
import edu.uth.evservice.repositories.IPartRepository;
import edu.uth.evservice.repositories.IServiceItemPartRepository;
import edu.uth.evservice.repositories.IServiceItemRepository;
import edu.uth.evservice.repositories.IServiceTicketRepository;
import edu.uth.evservice.repositories.ITicketPartRepository;
import edu.uth.evservice.repositories.ITicketServiceItemRepository;
import edu.uth.evservice.repositories.IUserRepository;
import edu.uth.evservice.repositories.IVehicleRepository;
import edu.uth.evservice.requests.AddServiceItemRequest;
import edu.uth.evservice.requests.NotificationRequest;
import edu.uth.evservice.requests.ServiceTicketRequest;
import edu.uth.evservice.requests.UpdatePartQuantityRequest;
import edu.uth.evservice.services.INotificationService;
import edu.uth.evservice.services.IServiceTicketService;
import edu.uth.evservice.services.ai.ServiceItemAIService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ServiceTicketServiceImpl implements IServiceTicketService {

    private final IServiceTicketRepository ticketRepo;
    private final IAppointmentRepository appointmentRepo;
    private final IVehicleRepository vehicleRepo;
    private final IUserRepository userRepo;

    private final ITicketServiceItemRepository ticketServiceItemRepository;
    //
    private final INotificationService notificationService;

    private final IServiceItemRepository serviceItemRepo;
    private final IPartRepository partRepo;
    private final IInventoryRepository inventoryRepo;
    private final ITicketPartRepository ticketPartRepo;
    private final IServiceItemPartRepository suggestionRepo;

    // ai
    private final ServiceItemAIService serviceItemAIService;

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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu dịch vụ"));
    }

    @Override
    public ServiceTicketDto createTicket(ServiceTicketRequest request) {
        Appointment appointment = appointmentRepo.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn."));

        User technician = userRepo.findById(request.getTechnicianId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kỹ thuật viên."));

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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu dịch vụ:"));

        ticket.setStartTime(request.getStartTime());
        ticket.setEndTime(request.getEndTime());
        ticket.setNotes(request.getNotes());

        // --- 2. NÂNG CẤP LOGIC CẬP NHẬT TRẠNG THÁI ---
        ServiceTicketStatus newStatus = null;
        if (request.getStatus() != null) {
            newStatus = ServiceTicketStatus.valueOf(request.getStatus().toUpperCase());
            ticket.setStatus(newStatus);
        }

        ServiceTicket savedTicket = ticketRepo.save(ticket);

        // === 3. PHẦN CODE MỚI THÊM VÀO (Gửi thông báo) ===

        // Kiểm tra xem trạng thái mới có phải là "HOÀN THÀNH" không
        // (Giả sử trạng thái hoàn thành là 'COMPLETED', bạn hãy thay đổi nếu cần)
        if (newStatus != null && newStatus == ServiceTicketStatus.COMPLETED) {

            // Lấy thông tin khách hàng từ lịch hẹn liên quan
            User customer = savedTicket.getAppointment().getCustomer();

            NotificationRequest customerNoti = new NotificationRequest();
            customerNoti.setUserId(customer.getUserId()); // ID người nhận (Khách hàng)
            customerNoti.setTitle("Dịch vụ của bạn đã hoàn tất!");
            customerNoti.setMessage("Dịch vụ cho xe [" + savedTicket.getAppointment().getVehicle().getLicensePlate() +
                    "] (Phiếu #" + savedTicket.getTicketId() + ") đã được hoàn thành. " +
                    "Vui lòng đợi thông báo hóa đơn để thanh toán.");

            notificationService.createNotification(customerNoti); // Gửi đi
        }

        return toDto(ticketRepo.save(ticket));
    }

    @Override
    public void deleteTicket(Integer id) {
        ticketRepo.deleteById(id);
    }

    // --- LOGIC MỚI CHO WORKFLOW ---

    // tech tao ticket tu appointment duoc giao
    @Override
    public ServiceTicketDto createTicketFromAppointment(Integer appointmentId, Integer technicianId) {
        Appointment appointment = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lịch hẹn với ID: " + appointmentId));

        if (appointment.getStatus() != AppointmentStatus.ASSIGNED) {
            throw new IllegalStateException("Không thể tạo phiếu dịch vụ. Khách chưa được giao cho kỹ thuật viên.");
        }
        // loai bo de co the tao nhieu ticket cho 1 appointment
        // if (appointment.getServiceTickets() != null) {
        // throw new IllegalStateException("A service ticket has already been created
        // for this appointment.");
        // }
        if (!appointment.getAssignedTechnician().getUserId().equals(technicianId)) {
            throw new SecurityException("Bạn không được giao lịch hẹn này.");
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
        CustomerPackageContract contract = appointment.getContract();
        if (contract != null && contract.getServicePackage() != null) {
            ServicePackage servicePackage = contract.getServicePackage();
            List<ServiceItem> itemsInPackage = servicePackage.getServiceItems();

            for (ServiceItem item : itemsInPackage) {
                TicketServiceItem tsi = TicketServiceItem.builder()
                        .id(new TicketServiceItemId(savedTicket.getTicketId(), item.getItemId()))
                        .serviceTicket(savedTicket)
                        .serviceItem(item)
                        .quantity(1)
                        .unitPriceAtTimeOfService(0.0) // Miễn phí vì nằm trong gói
                        .build();
                ticketServiceItemRepository.save(tsi);
            }
        }

        return toDto(savedTicket);
    }

    @Override
    public ServiceTicketDto completeWorkOnTicket(Integer ticketId, Integer technicianId) {
        verifyTicketOwnership(technicianId, ticketId);
        ServiceTicket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy vé dịch vụ"));

        // 4. KIỂM TRA LOGIC: Phiếu có đang 'IN_PROGRESS' không?
        if (ticket.getStatus() != ServiceTicketStatus.IN_PROGRESS) {
            throw new IllegalStateException("Chỉ có thể hoàn thành các phiếu đang ở trạng thái 'IN_PROGRESS'.");
        }

        // 5. CẬP NHẬT PHIẾU
        ticket.setStatus(ServiceTicketStatus.COMPLETED); // Đổi trạng thái
        ticket.setEndTime(LocalDateTime.now()); // Ghi lại thời gian hoàn thành

        ServiceTicket savedTicket = ticketRepo.save(ticket);

        // === 6. PHẦN CODE GỬI THÔNG BÁO ===
        // Lấy ra Appointment cha
        Appointment appointment = savedTicket.getAppointment();
        // 3.2. Cập nhật trạng thái của Appointment cha
        appointment.setStatus(AppointmentStatus.COMPLETED);// Doi trang thai
        appointment.setUpdatedAt(LocalDateTime.now());

        appointmentRepo.save(appointment);

        // Cập nhật ngày bảo trì gần nhất cho Vehicle
        Vehicle vehicle = appointment.getVehicle();
        if (vehicle != null) {
            vehicle.setRecentMaintenanceDate(LocalDate.now());
            vehicleRepo.save(vehicle);
        }

        // Lấy thông tin khách hàng từ lịch hẹn liên quan
        User customer = savedTicket.getAppointment().getCustomer();

        NotificationRequest customerNoti = new NotificationRequest();
        customerNoti.setUserId(customer.getUserId()); // ID người nhận (Khách hàng)
        customerNoti.setTitle("Dịch vụ của bạn đã hoàn tất!");
        customerNoti.setMessage("Dịch vụ cho xe [" + savedTicket.getAppointment().getVehicle().getLicensePlate() +
                "] (Phiếu #" + savedTicket.getTicketId() + ") đã được hoàn thành. " +
                "Vui lòng đợi thông báo hóa đơn để thanh toán.");

        notificationService.createNotification(customerNoti); // Gửi đi

        // 7. Trả về kết quả
        return toDto(savedTicket); // Giả sử bạn có hàm toDto
    }

    // kiem tra quyen so huu ticket cua tech
    @Override
    public void verifyTicketOwnership(Integer technicianId, Integer ticketId) {
        ServiceTicket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy phiếu dịch vụ:: " + ticketId));

        if (!ticket.getTechnician().getUserId().equals(technicianId)) {
            throw new SecurityException("Access Denied: You do not own this service ticket.");
        }
    }

    @Override
    public List<ServiceTicketDto> getTicketsByTechnicianId(Integer technicianId) {
        User tech = userRepo.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user này"));
        return ticketRepo.findByTechnician_UserId(technicianId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // cap nhat ticket status
    @Override
    public ServiceTicketDto updateTicketStatus(Integer ticketId, Integer technicianId, ServiceTicketStatus newStatus) {
        verifyTicketOwnership(technicianId, ticketId);
        ServiceTicket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy phiếu dịch vụ:"));
        ticket.setStatus(newStatus);
        return toDto(ticketRepo.save(ticket));
    }

    @Override
    public ServiceTicketDto updateTicketNotes(Integer ticketId, Integer technicianId, String newNotes) {
        verifyTicketOwnership(technicianId, ticketId);
        ServiceTicket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy phiếu dịch vụ:"));
        ticket.setNotes(newNotes);
        return toDto(ticketRepo.save(ticket));
    }

    @Override
    public SuggestedPartsDto addServiceItemToTicket(Integer ticketId, AddServiceItemRequest request,
            Integer technicianId) {
        ServiceTicket ticket = getTicketAndVerifyStatus(ticketId, technicianId);

        ServiceCenter techCenter = getCenterFromUsername(technicianId);

        ServiceItem item = serviceItemRepo.findById(request.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hạng mục dịch vụ này"));

        if (ticketServiceItemRepository.existsById(new TicketServiceItemId(ticketId, request.getItemId()))) {
            throw new IllegalStateException("Hạng mục dịch vụ này đã tồn tại");
        }

        // Tạo TicketServiceItem
        TicketServiceItem ticketServiceItem = TicketServiceItem.builder()
                .id(new TicketServiceItemId(ticketId, request.getItemId()))
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
                .map(suggestion -> {
                    Part part = suggestion.getPart();

                    int suggestedQty = suggestion.getQuantity();

                    // Lấy tồn kho
                    int stock = inventoryRepo.findByPart_PartIdAndServiceCenter(part.getPartId(), techCenter)
                            .map(Inventory::getQuantity).orElse(0);

                    return toSuggestedDto(part, suggestedQty, stock);
                }).collect(Collectors.toList());

        // Trả về DTO gợi ý danh sách phụ tùng cho item đó
        return SuggestedPartsDto.builder()
                .serviceItemAdded(ticketServiceItemDto)
                .suggestedParts(suggestedParts)
                .build();
    }

    @Override
    public void removeServiceItemFromTicket(Integer ticketId, Integer itemId, Integer technicianId) {
        getTicketAndVerifyStatus(ticketId, technicianId);

        TicketServiceItemId id = new TicketServiceItemId(ticketId, itemId);
        if (!ticketServiceItemRepository.existsById(id)) {
            throw new EntityNotFoundException("Hạng mục dịch vụ này không tìm thấy trên phiếu.");
        }

        ticketServiceItemRepository.deleteById(id);
    }

    /**
     * Cập nhật số lượng của một Part trên Ticket nếu tech ko muốn lấy số lượng như
     * gợi ý.
     * 1. Lấy số lượng Tech muốn
     * 2. Lấy số lượng đang có trên ticket
     * 3. Tính chênh lệch (delta = newQuantity - currentQuantity)
     * 4. Kiểm tra kho xem có đủ cho (delta) không
     * 5. Cập nhật kho (trừ hoặc cộng trả lại kho)
     * 6. Cập nhật bảng TicketPart
     */
    @Override
    public TicketPartDto updatePartOnTicket(Integer ticketId, UpdatePartQuantityRequest request, Integer technicianId) {
        ServiceTicket ticket = getTicketAndVerifyStatus(ticketId, technicianId);

        Part part = partRepo.findById(request.getPartId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phụ tùng"));

        int newQuantity = request.getQuantity();
        if (newQuantity < 0) {
            throw new IllegalArgumentException("Số lượng không thể âm.");
        }

        TicketPartId id = new TicketPartId(ticketId, request.getPartId());

        // Lấy số lượng hiện tại
        int currentQuantity = ticketPartRepo.findById(id)
                .map(TicketPart::getQuantity)
                .orElse(0);

        // Tính toán chênh lệch (delta)
        int delta = newQuantity - currentQuantity;

        if (delta == 0 && currentQuantity == 0) {
            throw new IllegalStateException("Không thể cập nhật số lượng từ 0 đến 0.");
        }

        if (delta == 0) {
            return toDto(ticketPartRepo.findById(id).get());
        }

        ServiceCenter techCenter = getCenterFromUsername(technicianId);

        Inventory inventory = inventoryRepo.findByPart_PartIdAndServiceCenter(request.getPartId(), techCenter)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hàng tồn kho cho phụ tùng này"));

        if (delta > 0) {
            if (inventory.getQuantity() < delta) {
                throw new IllegalStateException("Không đủ hàng cho phụ tùng này: " + part.getPartName() +
                        ". Yêu cầu: " + delta +
                        ", Có sẵn: " + inventory.getQuantity());
            }
        }

        // Cập nhật kho (delta có thể âm, nghĩa là trả hàng vào kho)
        inventory.setQuantity(inventory.getQuantity() - delta);
        Inventory updatedInventory = inventoryRepo.save(inventory);

        if (newQuantity == 0) {
            if (currentQuantity > 0) {
                ticketPartRepo.deleteById(id);
            }
            return buildZeroQuantityPartDto(part);
        } else {
            TicketPart ticketPart = ticketPartRepo.findById(id)
                    .orElseGet(() -> TicketPart.builder() // Tạo mới nếu chưa có
                            .id(id)
                            .ticket(ticket)
                            .part(part)
                            .unitPriceAtTimeOfService(part.getUnitPrice())
                            .build());

            ticketPart.setQuantity(newQuantity);
            TicketPart savedTp = ticketPartRepo.save(ticketPart);
            // === PHẦN CODE MỚI THÊM VÀO (Gửi thông báo) ===

            // 1. Kiểm tra xem số lượng có SẮP HẾT HÀNG không
            if (updatedInventory.getQuantity() <= updatedInventory.getMinQuantity()) {

                // 2. Lấy danh sách nhân viên/admin tại trung tâm đó
                List<User> usersToNotify = userRepo.findByServiceCenter_CenterIdAndRoleIn(
                        techCenter.getCenterId(), List.of(Role.STAFF, Role.ADMIN));

                // 3. Gửi thông báo cho từng người
                for (User user : usersToNotify) {
                    NotificationRequest notiRequest = new NotificationRequest();
                    notiRequest.setUserId(user.getUserId());
                    notiRequest.setTitle("Cảnh báo Tồn kho Thấp!");
                    notiRequest.setMessage("Mặt hàng: '" + part.getPartName() +
                            "' tại trung tâm " + techCenter.getCenterName() +
                            " đã đạt mức tồn kho tối thiểu (" + updatedInventory.getMinQuantity()
                            + "). Cần nhập thêm.");

                    notificationService.createNotification(notiRequest);
                }
            }
            return toDto(savedTp);
        }
    }

    // Lấy ticket và kiểm tra trạng thái, nếu là in progress mới được thêm item và
    // part
    private ServiceTicket getTicketAndVerifyStatus(Integer ticketId, Integer technicianId) {
        verifyTicketOwnership(technicianId, ticketId);
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

        List<TicketServiceItemDto> itemDtos = ticketServiceItemRepository
                .findByServiceTicket_TicketId(ticket.getTicketId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        List<TicketPartDto> partDtos = ticketPartRepo
                .findByTicket_TicketId(ticket.getTicketId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return ServiceTicketDto.builder()
                .ticketId(ticket.getTicketId())
                .startTime(ticket.getStartTime())
                .endTime(ticket.getEndTime())
                .status(ticket.getStatus() != null ? ticket.getStatus().name() : null)
                .notes(ticket.getNotes())
                .serviceType(ticket.getAppointment().getServiceType())
                .customerName(ticket.getAppointment().getCustomer().getFullName())
                .staffName(ticket.getAppointment().getStaff() != null ? ticket.getAppointment().getStaff().getFullName()
                        : null)
                .noteCus(ticket.getAppointment().getNote())
                .licensePlate(ticket.getAppointment().getVehicle().getLicensePlate())
                .technicianId(ticket.getTechnician().getUserId())
                .items(itemDtos)
                .parts(partDtos)
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

    // private AppointmentDto toAppointmentDto(Appointment appointment) {
    // if (appointment == null) return null;
    //
    // return AppointmentDto.builder()
    // .serviceType(appointment.getServiceType())
    // .status(appointment.getStatus().name())
    // .customerName(appointment.getCustomer().getFullName())
    // .staffName(appointment.getStaff().getFullName())
    // .vehicleName(appointment.getVehicle().getBrand() + " " +
    // appointment.getVehicle().getModel())
    // .build();
    // }

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

    // Báo cáo hiệu suất
    public List<PerformanceDto> calculatePerformance(LocalDate start, LocalDate end) {
        // Kiểm tra tham số
        if (start == null || end == null) {
            throw new IllegalArgumentException("Ngày bắt đầu và kết thúc không được null.");
        }
        if (start.isAfter(end)) {
            throw new IllegalArgumentException("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
        }

        LocalDateTime startDate = start.atStartOfDay();
        LocalDateTime endDate = end.atTime(23, 59, 59);

        // Lấy ticket hoàn tất trong khoảng ngày
        List<ServiceTicket> tickets = ticketRepo
                .findByStatusAndEndTimeBetween(ServiceTicketStatus.COMPLETED, startDate, endDate);

        // Nếu không có ticket nào, có thể trả về danh sách rỗng nhưng vẫn show kỹ thuật
        // viên
        // Lấy danh sách kỹ thuật viên
        List<User> technicians = userRepo.findByRole(Role.TECHNICIAN);
        if (technicians.isEmpty()) {
            throw new EntityNotFoundException("Không có kỹ thuật viên nào trong hệ thống.");
        }

        // Gom nhóm ticket theo technician
        Map<Integer, List<ServiceTicket>> ticketsByTech = tickets.stream()
                .filter(t -> t.getTechnician() != null)
                .collect(Collectors.groupingBy(t -> t.getTechnician().getUserId()));

        List<PerformanceDto> report = new ArrayList<>();

        for (User tech : technicians) {
            List<ServiceTicket> techTickets = ticketsByTech.getOrDefault(tech.getUserId(), List.of());

            long totalSeconds = techTickets.stream()
                    .filter(t -> t.getStartTime() != null && t.getEndTime() != null)
                    .mapToLong(t -> Duration.between(t.getStartTime(), t.getEndTime()).getSeconds())
                    .sum();

            double totalHours = totalSeconds / 3600.0;
            int totalTickets = techTickets.size();

            report.add(new PerformanceDto(
                    tech.getUserId(),
                    tech.getFullName(),
                    totalTickets,
                    totalHours));
        }

        return report;
    }

    // lấy trung tâm của tech
    private ServiceCenter getCenterFromUsername(Integer technicianId) {
        User currentUser = userRepo.findById(technicianId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        ServiceCenter center = currentUser.getServiceCenter();
        if (center == null) {
            throw new IllegalStateException("Technician is not associated with any service center.");
        }
        return center;
    }

}
