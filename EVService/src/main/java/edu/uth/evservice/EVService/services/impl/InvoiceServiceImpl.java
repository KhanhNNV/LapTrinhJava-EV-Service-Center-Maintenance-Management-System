package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.InvoiceDto;
import edu.uth.evservice.EVService.model.Invoice;
import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.model.enums.PaymentMethod;
import edu.uth.evservice.EVService.model.enums.PaymentStatus;
import edu.uth.evservice.EVService.model.ServiceTicket;
import edu.uth.evservice.EVService.repositories.IInvoiceRepository;
import edu.uth.evservice.EVService.repositories.IServiceTicketRepository;
import edu.uth.evservice.EVService.repositories.IUserRepository;
import edu.uth.evservice.EVService.requests.CreateInvoiceRequest;
import edu.uth.evservice.EVService.services.IInvoiceService;
import jakarta.persistence.EntityNotFoundException;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
public class InvoiceServiceImpl implements IInvoiceService {
    final IInvoiceRepository invoiceRepository;
    final IUserRepository userRepository;
    final IServiceTicketRepository serviceTicketRepository;

    @Override
    public List<InvoiceDto> getAllInvoices() {
        return invoiceRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public InvoiceDto getInvoiceById(Integer id) {
        return invoiceRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with id: " + id));
    }

    @Override
    public InvoiceDto createInvoice(CreateInvoiceRequest request) {
        User user = userRepository.findById(request.getUserId()).orElseThrow(
            ()-> new EntityNotFoundException("Customer not found id: "+ request.getUserId()
        ));

        ServiceTicket ticket = serviceTicketRepository.findById(request.getTicketId()).orElseThrow(
            ()-> new EntityNotFoundException("Ticket not found id: "+ request.getTicketId()
        ));
        Invoice invoice = Invoice.builder()
                .invoiceDate(request.getInvoiceDate())
                .totalAmount(request.getTotalAmount())
                .paymentStatus(PaymentStatus.valueOf(request.getPaymentStatus().toUpperCase()))
                .paymentMethod(PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()))
                .user(user)
                .serviceTicket(ticket)
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);
        return toDto(savedInvoice);
    }

    @Override
    public InvoiceDto updateInvoice(Integer id, CreateInvoiceRequest request) {
        return invoiceRepository.findById(id)
                .map(existing -> {
                    User user = userRepository.findById(request.getUserId())
                        .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + request.getUserId()));
                    ServiceTicket ticket = serviceTicketRepository.findById(request.getTicketId())
                        .orElseThrow(() -> new EntityNotFoundException("ServiceTicket not found with id: " + request.getTicketId()));
                    existing.setInvoiceDate(request.getInvoiceDate());
                    existing.setTotalAmount(request.getTotalAmount());
                    existing.setPaymentStatus(PaymentStatus.valueOf(request.getPaymentStatus().toUpperCase()));
                    existing.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()));
                    existing.setUser(user);
                    existing.setServiceTicket(ticket);

                    Invoice updated = invoiceRepository.save(existing);
                    return toDto(updated);
                })
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with id: " + id));
    }
    

    @Override
    public void deleteInvoice(Integer id) {
        invoiceRepository.deleteById(id);
    }

    private InvoiceDto toDto(Invoice invoice) {
        return new InvoiceDto(
                invoice.getInvoiceId(),
                invoice.getInvoiceDate(),
                invoice.getTotalAmount(),
                invoice.getPaymentStatus().name(),
                invoice.getPaymentMethod().name(),
                invoice.getServiceTicket().getTicketId(),
                invoice.getUser().getUserId()
        );  
    }
    @Override
    public Map<String, Object> getFinancialSummary() {
        List<Invoice> allInvoices = invoiceRepository.findAll();

        double totalRevenue = allInvoices.stream()
                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.PAID)
                .mapToDouble(Invoice::getTotalAmount)
                .sum();

        // Giả sử chi phí = 70% doanh thu (chưa có bảng chi phí thực tế)
        // hoặc bạn có thể thay bằng tính toán từ bảng TicketPart
        double totalExpense = totalRevenue * 0.7;

        double profit = totalRevenue - totalExpense;

        return Map.of(
                "totalRevenue", totalRevenue,
                "totalExpense", totalExpense,
                "profit", profit,
                "paidInvoicesCount", allInvoices.stream().filter(i -> i.getPaymentStatus() == PaymentStatus.PAID).count(),
                "pendingInvoicesCount", allInvoices.stream().filter(i -> i.getPaymentStatus() == PaymentStatus.PENDING).count(),
                "cancelledInvoicesCount", allInvoices.stream().filter(i -> i.getPaymentStatus() == PaymentStatus.CANCELLED).count()
        );
    }
    @Override
    public Map<String, Object> getAnalyticsReport() {
        List<Invoice> invoices = invoiceRepository.findAll();

        // --- 1️⃣ Top dịch vụ phổ biến ---
        // (dựa vào ServiceTicket -> Appointment -> serviceType)
        Map<String, Long> serviceTypeCount = invoices.stream()
                .filter(inv -> inv.getServiceTicket() != null && inv.getServiceTicket().getAppointment() != null)
                .collect(Collectors.groupingBy(
                        inv -> inv.getServiceTicket().getAppointment().getServiceType(),
                        Collectors.counting()
                ));

        // Lấy dịch vụ phổ biến nhất
        String mostPopularService = serviceTypeCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Không có dữ liệu");

        // --- 2️⃣ Doanh thu theo loại dịch vụ ---
        Map<String, Double> revenueByServiceType = invoices.stream()
                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.PAID)
                .filter(inv -> inv.getServiceTicket() != null && inv.getServiceTicket().getAppointment() != null)
                .collect(Collectors.groupingBy(
                        inv -> inv.getServiceTicket().getAppointment().getServiceType(),
                        Collectors.summingDouble(Invoice::getTotalAmount)
                ));

        // --- 3️⃣ Xu hướng doanh thu theo tháng ---
        Map<String, Double> monthlyRevenue = invoices.stream()
                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.PAID)
                .collect(Collectors.groupingBy(
                        inv -> inv.getInvoiceDate().getYear() + "-" + String.format("%02d", inv.getInvoiceDate().getMonthValue()),
                        Collectors.summingDouble(Invoice::getTotalAmount)
                ));

        return Map.of(
                "mostPopularService", mostPopularService,
                "serviceUsageCount", serviceTypeCount,
                "revenueByServiceType", revenueByServiceType,
                "monthlyRevenueTrend", monthlyRevenue
        );
    }


}
