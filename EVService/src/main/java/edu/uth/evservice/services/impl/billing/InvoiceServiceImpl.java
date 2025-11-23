package edu.uth.evservice.services.impl.billing;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import edu.uth.evservice.models.*;
import edu.uth.evservice.models.enums.ContractStatus;
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
@RequiredArgsConstructor
public class InvoiceServiceImpl implements IInvoiceService {

    private final IInvoiceRepository invoiceRepo;
    private final IServiceTicketRepository serviceTicketRepo;
    private final ITicketPartRepository ticketPartRepo;
    private final ITicketServiceItemRepository ticketItemRepo;
    private final IUserRepository userRepo;
    private final INotificationService notificationService;

    private final ICustomerPackageContractRepository customerPackageContractRepo;

    // --- 1. HÀM HELPER RIÊNG ---
    private InvoiceDto convertToDetailedDto(Invoice invoice) {
        List<TicketServiceItem> serviceItems = new ArrayList<>();
        List<TicketPart> parts = new ArrayList<>();

        // Thay đổi User thành String để linh hoạt
        String technicianName = "N/A";
        String staffName = "Hệ thống";

        // TRƯỜNG HỢP 1: Hóa đơn từ Phiếu Dịch Vụ (Ticket)
        if (invoice.getServiceTicket() != null) {
            Integer ticketId = invoice.getServiceTicket().getTicketId();

            serviceItems = ticketItemRepo.findByServiceTicket_TicketId(ticketId);
            parts = ticketPartRepo.findByTicket_TicketId(ticketId);

            // Lấy tên KTV
            if (invoice.getServiceTicket().getTechnician() != null) {
                technicianName = invoice.getServiceTicket().getTechnician().getFullName();
            }

            // Lấy tên nhân viên tiếp nhận (từ Appointment)
            if (invoice.getServiceTicket().getAppointment() != null
                    && invoice.getServiceTicket().getAppointment().getStaff() != null) {
                staffName = invoice.getServiceTicket().getAppointment().getStaff().getFullName();
            }
        }
        // TRƯỜNG HỢP 2: Hóa đơn từ Hợp đồng (Contract)
        else if (invoice.getContract() != null) {
            staffName = "Đăng ký gói Online";
            // technicianName giữ mặc định là "N/A"
            // Items và Parts để rỗng
        }

        double subtotalItems = serviceItems.stream()
                .mapToDouble(TicketServiceItem::getUnitPriceAtTimeOfService)
                .sum();

        double subtotalParts = parts.stream()
                .mapToDouble(part -> part.getQuantity() * part.getUnitPriceAtTimeOfService())
                .sum();

        // Truyền String names vào toDto thay vì Object User
        return toDto(invoice, serviceItems, parts, subtotalItems, subtotalParts, staffName, technicianName);
    }

    @Override
    public List<InvoiceDto> getAllInvoices() {
        List<Invoice> invoices = invoiceRepo.findAll(Sort.by(Sort.Direction.DESC, "invoiceDate"));
        return invoices.stream()
                .map(this::convertToDetailedDto)
                .collect(Collectors.toList());
    }

    @Override
    public Page<InvoiceDto> getMyInvoices(Integer userId, int page, int limit) {
        Pageable pageable = PageRequest.of(page, limit, Sort.by("invoiceDate").descending());
        Page<Invoice> invoicePage = invoiceRepo.findByUser_UserId(userId, pageable);
        return invoicePage.map(this::convertToDetailedDto);
    }

    @Override
    public InvoiceDto createInvoiceForTicket(Integer ticketId, Integer staffId) {
        ServiceTicket serviceTicket = serviceTicketRepo.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiếu dịch vụ"));

        User staff = userRepo.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user đang tạo hóa đơn"));

        User tech = serviceTicket.getTechnician();

        if (serviceTicket.getStatus() != ServiceTicketStatus.COMPLETED) {
            throw new IllegalStateException("Phiếu dịch vụ này chưa hoàn thành, không thể tạo hóa đơn");
        }

        if (invoiceRepo.findByServiceTicket_TicketId(ticketId).isPresent()) {
            throw new IllegalStateException("Hóa đơn cho phiếu dịch vụ này đã được tạo");
        }

        List<TicketServiceItem> serviceItems = ticketItemRepo.findByServiceTicket_TicketId(ticketId);
        List<TicketPart> parts = ticketPartRepo.findByTicket_TicketId(ticketId);

        double subtotalItems = serviceItems.stream().mapToDouble(TicketServiceItem::getUnitPriceAtTimeOfService).sum();
        double subtotalParts = parts.stream()
                .mapToDouble(part -> part.getQuantity() * part.getUnitPriceAtTimeOfService()).sum();
        double grandTotal = subtotalParts + subtotalItems;

        User customer = serviceTicket.getAppointment().getCustomer();

        Invoice invoice = Invoice.builder()
                .invoiceDate(LocalDateTime.now())
                .totalAmount(grandTotal)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentMethod(PaymentMethod.UNSPECIFIED)
                .serviceTicket(serviceTicket)
                .user(customer)
                .build();

        Invoice savedInvoice = invoiceRepo.save(invoice);

        serviceTicket.setInvoice(savedInvoice);
        serviceTicketRepo.save(serviceTicket);

        NotificationRequest customerNoti = new NotificationRequest();
        customerNoti.setUserId(customer.getUserId());
        customerNoti.setTitle("Hóa đơn mới cho dịch vụ của bạn!");
        customerNoti.setMessage("Hóa đơn #" + savedInvoice.getInvoiceId() + " với tổng số tiền " +
                savedInvoice.getTotalAmount() + " đã được tạo. Vui lòng thanh toán.");
        notificationService.createNotification(customerNoti);

        // Truyền tên trực tiếp vào hàm toDto
        return toDto(savedInvoice, serviceItems, parts, subtotalItems, subtotalParts,
                staff.getFullName(),
                tech != null ? tech.getFullName() : "N/A");
    }

    @Override
    public InvoiceDto getInvoiceByTicketId(Integer ticketId) {
        Invoice invoice = invoiceRepo.findByServiceTicket_TicketId(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Hóa đơn cho phiếu dịch vụ"));
        return convertToDetailedDto(invoice);
    }

    @Override
    @Transactional
    public InvoiceDto updatePaymentStatus(Integer invoiceId, String newStatus) {
        Invoice invoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn với ID: " + invoiceId));

        PaymentStatus status;
        try {
            status = PaymentStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái thanh toán không hợp lệ: " + newStatus);
        }

        if (invoice.getPaymentStatus() == PaymentStatus.PAID && status == PaymentStatus.PENDING) {
            throw new IllegalStateException("Hóa đơn đã thanh toán, không thể chuyển về trạng thái chờ.");
        }

        invoice.setPaymentStatus(status);

        if (status == PaymentStatus.PAID &&
                (invoice.getPaymentMethod() == PaymentMethod.UNSPECIFIED || invoice.getPaymentMethod() == null)) {
            invoice.setPaymentMethod(PaymentMethod.CASH);

        }

        CustomerPackageContract contract = invoice.getContract();
        contract.setStatus(ContractStatus.ACTIVE);

        customerPackageContractRepo.save(contract);

        Invoice savedInvoice = invoiceRepo.save(invoice);

        try {
            NotificationRequest noti = new NotificationRequest();
            noti.setUserId(savedInvoice.getUser().getUserId());
            noti.setTitle("Thanh toán thành công");
            noti.setMessage("Hóa đơn #" + invoiceId + " đã được xác nhận thanh toán tiền mặt.");
            notificationService.createNotification(noti);
        } catch (Exception e) {
            System.out.println("Lỗi khi gửi thông báo thanh toán: " + e.getMessage());
        }

        return convertToDetailedDto(savedInvoice);
    }

    // --- CÁC HÀM MAPPER DTO ---
    private InvoiceDto toDto(Invoice invoice,
            List<TicketServiceItem> serviceItems,
            List<TicketPart> parts,
            double serviceTotal,
            double partTotal,
            String staffName,
            String technicianName) {
        if (invoice == null)
            return null;

        Integer ticketId = null;
        Integer contractId = null;
        Integer appointmentId = null;
        String customerName = "";
        String customerPhone = "";

        if (invoice.getUser() != null) {
            customerName = invoice.getUser().getFullName();
            customerPhone = invoice.getUser().getPhoneNumber();
        }

        if (invoice.getServiceTicket() != null) {
            ticketId = invoice.getServiceTicket().getTicketId();
            if (invoice.getServiceTicket().getAppointment() != null) {
                appointmentId = invoice.getServiceTicket().getAppointment().getAppointmentId();
            }
        }

        if (invoice.getContract() != null) {
            contractId = invoice.getContract().getContractId();
        }

        List<TicketServiceItemDto> itemDtos = serviceItems.stream().map(this::toDto).collect(Collectors.toList());
        List<TicketPartDto> partDtos = parts.stream().map(this::toDto).collect(Collectors.toList());

        double finalGrandTotal = invoice.getTotalAmount();

        return InvoiceDto.builder()
                .id(invoice.getInvoiceId())
                .ticketId(ticketId)
                .contractId(contractId)
                .appointmentId(appointmentId)
                .completedTime(invoice.getInvoiceDate())

                .customerName(customerName)
                .customerPhone(customerPhone)

                .technicianName(technicianName)
                .staffName(staffName)

                .serviceItems(itemDtos)
                .partsUsed(partDtos)

                .serviceTotal(serviceTotal)
                .partTotal(partTotal)
                .grandTotal(finalGrandTotal)

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

    @Override
    public List<InvoiceDto> getInvoicesByUserId(Integer userId) {
        if (!userRepo.existsById(userId)) {
            throw new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId);
        }

        return invoiceRepo.findByUser_UserId(userId, PageRequest.of(0, 1000, Sort.by("invoiceDate").descending()))
                .stream()
                .map(this::convertToDetailedDto)
                .collect(Collectors.toList());
    }
}