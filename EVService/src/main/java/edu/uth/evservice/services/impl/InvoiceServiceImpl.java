package edu.uth.evservice.services.impl;

import edu.uth.evservice.dtos.InvoiceDto;
import edu.uth.evservice.dtos.TicketPartDto;
import edu.uth.evservice.dtos.TicketServiceItemDto;
import edu.uth.evservice.exception.ResourceNotFoundException;
import edu.uth.evservice.models.*;
import edu.uth.evservice.models.enums.PaymentMethod;
import edu.uth.evservice.models.enums.PaymentStatus;
import edu.uth.evservice.models.enums.ServiceTicketStatus;
import edu.uth.evservice.repositories.*;
import edu.uth.evservice.requests.CreateInvoiceRequest;
import edu.uth.evservice.requests.NotificationRequest;
import edu.uth.evservice.services.IInvoiceService;
import edu.uth.evservice.services.INotificationService;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
public class InvoiceServiceImpl implements IInvoiceService {

    private final IInvoiceRepository invoiceRepo;
    private final IServiceTicketRepository serviceTicketRepo;
    private final ITicketPartRepository ticketPartRepo;
    private final ITicketServiceItemRepository  ticketItemRepo;
    private final IUserRepository userRepo;
    private final INotificationService notificationService;


    @Override
    public InvoiceDto createInvoiceForTicket(Integer ticketId, Integer staffId) {
        // Kiểm tra đầu vào
        ServiceTicket serviceTicket = serviceTicketRepo.findById(ticketId).orElseThrow(()->new ResourceNotFoundException("Không tìm thấy phiếu dịch vụ"));

        User staff = userRepo.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user đang tạo hóa đơn"));

        if(serviceTicket.getStatus() != ServiceTicketStatus.COMPLETED){
            throw new IllegalStateException("Phiếu dịch vụ này chưa hoàn thành, không thể tạo hóa đơn");
        }

        if(invoiceRepo.findByServiceTicket_TicketId(ticketId).isPresent()){
            throw new IllegalStateException("Hóa đơn cho phiếu dịch vụ này đã được tạo");
        }

        // Tính tổng tiền
        List<TicketServiceItem> serviceItems = ticketItemRepo.findByServiceTicket_TicketId(ticketId);
        List<TicketPart> parts = ticketPartRepo.findByTicket_TicketId(ticketId);

        double subtotalItems= serviceItems.stream()
                .mapToDouble(item->item.getQuantity() * item.getUnitPriceAtTimeOfService())
                .sum();
        double subtotalParts=parts.stream()
                .mapToDouble(part-> part.getQuantity() * part.getUnitPriceAtTimeOfService())
                .sum();

        double grandTotal= subtotalParts+subtotalItems;

        // Lấy customer
        User customer = serviceTicket.getAppointment().getCustomer();

        Invoice invoice= Invoice.builder()
                .invoiceDate(LocalDate.now())
                .totalAmount(grandTotal)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentMethod(PaymentMethod.UNSPECIFIED)
                .serviceTicket(serviceTicket)
                .user(customer)
                .build();
        Invoice save=invoiceRepo.save(invoice);
        return toDto(save, serviceItems, parts, subtotalItems, subtotalParts,staff);

        Invoice savedInvoice = invoiceRepository.save(invoice);

        // === 2. PHẦN CODE MỚI THÊM VÀO (Gửi thông báo) ===
        NotificationRequest customerNoti = new NotificationRequest();
        customerNoti.setUserId(user.getUserId()); // ID người nhận (Khách hàng)
        customerNoti.setTitle("Hóa đơn mới cho dịch vụ của bạn!");
        customerNoti.setMessage("Hóa đơn #" + savedInvoice.getInvoiceId() + " với tổng số tiền " +
                savedInvoice.getTotalAmount() + " đã được tạo. Vui lòng thanh toán.");

        notificationService.createNotification(customerNoti); // Gửi đi
        return toDto(savedInvoice);
    }

    @Override
    public InvoiceDto getInvoiceByTicketId(Integer ticketId) {
        Invoice invoice = invoiceRepo.findByServiceTicket_TicketId(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Hóa đơn cho phiếu dịch vụ"));

        List<TicketServiceItem> serviceItems = ticketItemRepo.findByServiceTicket_TicketId(ticketId);
        List<TicketPart> parts = ticketPartRepo.findByTicket_TicketId(ticketId);

        double subtotalItems = serviceItems.stream()
                .mapToDouble(item->item.getQuantity() * item.getUnitPriceAtTimeOfService())
                .sum();
        double subtotalParts = parts.stream()
                .mapToDouble(part-> part.getQuantity() * part.getUnitPriceAtTimeOfService())
                .sum();

        User assginTech = invoice.getServiceTicket().getTechnician();
        return toDto(invoice, serviceItems, parts, subtotalItems, subtotalParts,assginTech);
    }

    @Override
    public InvoiceDto updatePaymentStatus(Integer invoiceId, String newStatus) {
        Invoice invoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn"));

        PaymentStatus status;
        try {
            status = PaymentStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái thanh toán không hợp lệ: " + newStatus);
        }

        if (invoice.getPaymentStatus() == PaymentStatus.PAID && status == PaymentStatus.PENDING) {
            throw new IllegalStateException("Không thể chuyển trạng thái từ PAID sang PENDING.");
        }

        invoice.setPaymentStatus(status);

        Invoice updatedInvoice = invoiceRepo.save(invoice);

        return getInvoiceByTicketId(updatedInvoice.getServiceTicket().getTicketId());
    }

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

        List<TicketServiceItemDto> itemDtos = serviceItems.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        List<TicketPartDto> partDtos = parts.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        double grandTotal = serviceTotal + partTotal;

        return InvoiceDto.builder()
                // Thông tin chung
                .ticketId(ticket.getTicketId())
                .appointmentId(appointment.getAppointmentId())
                .completedTime(ticket.getEndTime()) // Thời gian hoàn thành phiếu

                // Thông tin khách hàng
                .customerName(customer.getFullName())
                .customerPhone(customer.getPhoneNumber())

                // Thông tin kỹ thuật viên
                .technicianName(staff != null ? staff.getFullName() : "N/A")

                // Chi tiết dịch vụ và phụ tùng
                .serviceItems(itemDtos)
                .partsUsed(partDtos)

                // Tổng tiền
                .serviceTotal(serviceTotal)
                .partTotal(partTotal)
                .grandTotal(grandTotal)
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
