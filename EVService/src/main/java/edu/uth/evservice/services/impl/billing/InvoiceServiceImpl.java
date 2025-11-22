package edu.uth.evservice.services.impl.billing;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import edu.uth.evservice.models.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.uth.evservice.dtos.InvoiceDto;
import edu.uth.evservice.dtos.TicketPartDto;
import edu.uth.evservice.dtos.TicketServiceItemDto;
import edu.uth.evservice.exception.ResourceNotFoundException;
import edu.uth.evservice.models.enums.PaymentMethod;
import edu.uth.evservice.models.enums.PaymentStatus;
import edu.uth.evservice.models.enums.ServiceTicketStatus;
import edu.uth.evservice.repositories.*;
import edu.uth.evservice.requests.NotificationRequest;
import edu.uth.evservice.services.INotificationService;
import edu.uth.evservice.services.billing.IInvoiceService;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor // Dùng cái này thay cho AllArgsConstructor để gọn hơn với final fields
public class InvoiceServiceImpl implements IInvoiceService {

    private final IInvoiceRepository invoiceRepo;
    private final IServiceTicketRepository serviceTicketRepo;
    private final ITicketPartRepository ticketPartRepo;
    private final ITicketServiceItemRepository ticketItemRepo;
    private final IUserRepository userRepo;
    private final INotificationService notificationService;

    // --- 1. HÀM HELPER RIÊNG (Để tái sử dụng logic lấy chi tiết) ---
    private InvoiceDto convertToDetailedDto(Invoice invoice) {
        Integer ticketId = invoice.getServiceTicket().getTicketId();

        // Lấy items và parts
        List<TicketServiceItem> serviceItems = ticketItemRepo.findByServiceTicket_TicketId(ticketId);
        List<TicketPart> parts = ticketPartRepo.findByTicket_TicketId(ticketId);

        // Tính tổng tiền items
        double subtotalItems = serviceItems.stream()
                .mapToDouble(TicketServiceItem::getUnitPriceAtTimeOfService)
                .sum();

        // Tính tổng tiền parts
        double subtotalParts = parts.stream()
                .mapToDouble(part -> part.getQuantity() * part.getUnitPriceAtTimeOfService())
                .sum();

        User assignTech = invoice.getServiceTicket().getTechnician();

        // Gọi hàm map DTO gốc
        return toDto(invoice, serviceItems, parts, subtotalItems, subtotalParts, assignTech);
    }

    // --- 2. CẬP NHẬT getAllInvoices ---
    @Override
    public List<InvoiceDto> getAllInvoices() {
        // Lấy tất cả hóa đơn, sắp xếp cái mới nhất lên đầu
        List<Invoice> invoices = invoiceRepo.findAll(Sort.by(Sort.Direction.DESC, "invoiceDate"));

        // Map qua hàm helper để lấy full chi tiết
        return invoices.stream()
                .map(this::convertToDetailedDto)
                .collect(Collectors.toList());
    }

    // --- CẬP NHẬT getMyInvoices ---
    @Override
    public Page<InvoiceDto> getMyInvoices(Integer userId, int page, int limit) {
        Pageable pageable = PageRequest.of(page, limit, Sort.by("invoiceDate").descending());
        Page<Invoice> invoicePage = invoiceRepo.findByUser_UserId(userId, pageable);

        // Sử dụng lại hàm helper convertToDetailedDto
        return invoicePage.map(this::convertToDetailedDto);
    }

    @Override
    public InvoiceDto createInvoiceForTicket(Integer ticketId, Integer staffId) {
        // ... (Giữ nguyên code kiểm tra logic cũ) ...
        ServiceTicket serviceTicket = serviceTicketRepo.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiếu dịch vụ"));

        User staff = userRepo.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user đang tạo hóa đơn"));

        if (serviceTicket.getStatus() != ServiceTicketStatus.COMPLETED) {
            throw new IllegalStateException("Phiếu dịch vụ này chưa hoàn thành, không thể tạo hóa đơn");
        }

        if (invoiceRepo.findByServiceTicket_TicketId(ticketId).isPresent()) {
            throw new IllegalStateException("Hóa đơn cho phiếu dịch vụ này đã được tạo");
        }

        // ... (Phần tính toán giữ nguyên hoặc dùng lại logic helper nếu muốn) ...
        List<TicketServiceItem> serviceItems = ticketItemRepo.findByServiceTicket_TicketId(ticketId);
        List<TicketPart> parts = ticketPartRepo.findByTicket_TicketId(ticketId);

        double subtotalItems = serviceItems.stream().mapToDouble(TicketServiceItem::getUnitPriceAtTimeOfService).sum();
        double subtotalParts = parts.stream().mapToDouble(part -> part.getQuantity() * part.getUnitPriceAtTimeOfService()).sum();
        double grandTotal = subtotalParts + subtotalItems;

        User customer = serviceTicket.getAppointment().getCustomer();

        Invoice invoice = Invoice.builder()
                .invoiceDate(LocalDate.now())
                .totalAmount(grandTotal)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentMethod(PaymentMethod.UNSPECIFIED)
                .serviceTicket(serviceTicket)
                .user(customer)
                .build();

        Invoice savedInvoice = invoiceRepo.save(invoice);

        serviceTicket.setInvoice(savedInvoice);
        serviceTicketRepo.save(serviceTicket);

        // Gửi thông báo
        NotificationRequest customerNoti = new NotificationRequest();
        customerNoti.setUserId(customer.getUserId());
        customerNoti.setTitle("Hóa đơn mới cho dịch vụ của bạn!");
        customerNoti.setMessage("Hóa đơn #" + savedInvoice.getInvoiceId() + " với tổng số tiền " +
                savedInvoice.getTotalAmount() + " đã được tạo. Vui lòng thanh toán.");
        notificationService.createNotification(customerNoti);

        return toDto(savedInvoice, serviceItems, parts, subtotalItems, subtotalParts, staff);
    }

    @Override
    public InvoiceDto getInvoiceByTicketId(Integer ticketId) {
        Invoice invoice = invoiceRepo.findByServiceTicket_TicketId(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Hóa đơn cho phiếu dịch vụ"));

        // Sử dụng hàm helper cho gọn
        return convertToDetailedDto(invoice);
    }


    @Override
    @Transactional
    public InvoiceDto updatePaymentStatus(Integer invoiceId, String newStatus) {
        // 1. Tìm hóa đơn
        Invoice invoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn với ID: " + invoiceId));

        // 2. Validate trạng thái gửi lên
        PaymentStatus status;
        try {
            status = PaymentStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái thanh toán không hợp lệ: " + newStatus);
        }

        // 3. Logic kiểm tra nghiệp vụ
        // Không cho phép chuyển từ PAID về PENDING (trừ khi hủy, nhưng logic đó nên tách riêng)
        if (invoice.getPaymentStatus() == PaymentStatus.PAID && status == PaymentStatus.PENDING) {
            throw new IllegalStateException("Hóa đơn đã thanh toán, không thể chuyển về trạng thái chờ.");
        }

        // 4. Cập nhật trạng thái
        invoice.setPaymentStatus(status);

        // --- LOGIC TỰ ĐỘNG SET TIỀN MẶT ---
        // Nếu Staff xác nhận PAID mà phương thức đang là UNSPECIFIED -> Gán là CASH
        if (status == PaymentStatus.PAID &&
                (invoice.getPaymentMethod() == PaymentMethod.UNSPECIFIED || invoice.getPaymentMethod() == null)) {
            invoice.setPaymentMethod(PaymentMethod.CASH);
        }

        // 5. Lưu xuống DB
        Invoice savedInvoice = invoiceRepo.save(invoice);

        // 6. Gửi thông báo cho Khách hàng
        try {
            NotificationRequest noti = new NotificationRequest();
            noti.setUserId(savedInvoice.getUser().getUserId());
            noti.setTitle("Thanh toán thành công");
            noti.setMessage("Hóa đơn #" + invoiceId + " đã được xác nhận thanh toán tiền mặt.");
            notificationService.createNotification(noti);
        } catch (Exception e) {
            System.out.println("loi khi gui thong bao thanh toan bang tien mat" + e.getMessage() ) ;
        }

        return convertToDetailedDto(savedInvoice);
    }

    // --- CÁC HÀM MAPPER DTO (GIỮ NGUYÊN) ---
    private InvoiceDto toDto(Invoice invoice,
                             List<TicketServiceItem> serviceItems,
                             List<TicketPart> parts,
                             double serviceTotal,
                             double partTotal,
                             User staff) {
        if (invoice == null) return null;

        ServiceTicket ticket = invoice.getServiceTicket();
        Appointment appointment = ticket.getAppointment();
        User customer = appointment.getCustomer();

        List<TicketServiceItemDto> itemDtos = serviceItems.stream().map(this::toDto).collect(Collectors.toList());
        List<TicketPartDto> partDtos = parts.stream().map(this::toDto).collect(Collectors.toList());

        double grandTotal = serviceTotal + partTotal;

        return InvoiceDto.builder()
                .id(ticket.getInvoice().getInvoiceId())
                .ticketId(ticket.getTicketId())
                .appointmentId(appointment.getAppointmentId())
                .completedTime(ticket.getEndTime())
                .customerName(customer.getFullName())
                .customerPhone(customer.getPhoneNumber())
                .technicianName(staff != null ? staff.getFullName() : "N/A")
                .staffName(ticket.getAppointment().getStaff().getFullName() != null
                        ? ticket.getAppointment().getStaff().getFullName() : "N/A")
                .serviceItems(itemDtos)
                .partsUsed(partDtos)
                .serviceTotal(serviceTotal)
                .partTotal(partTotal)
                .grandTotal(grandTotal)
                .paymentStatus(invoice.getPaymentStatus())
                .build();
    }

    private TicketServiceItemDto toDto(TicketServiceItem item) {
        return TicketServiceItemDto.builder()
                .itemId(item.getServiceItem().getItemId())
                .itemName(item.getServiceItem().getItemName())
                .quantity(item.getQuantity())
                .unitPriceAtTimeOfService(item.getUnitPriceAtTimeOfService())
                .build();
    }

    private TicketPartDto toDto(TicketPart part) {
        return TicketPartDto.builder()
                .partId(part.getPart().getPartId())
                .partName(part.getPart().getPartName())
                .quantity(part.getQuantity())
                .unitPriceAtTimeOfService(part.getUnitPriceAtTimeOfService())
                .build();
    }
}