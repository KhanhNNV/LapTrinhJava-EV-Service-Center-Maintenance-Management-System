package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.InvoiceDto;
import edu.uth.evservice.EVService.requests.CreateInvoiceRequest;

import java.util.List;

public interface IInvoiceService {
    List<InvoiceDto> getAllInvoices();
    InvoiceDto getInvoiceById(Integer id); 

    // Đề xuất thêm 3 thuật tính dưới và tạm commet để tránh lỗi ở InvoiceServiceImpl
    // List<InvoiceDto> getInvoicesByCustomerId(Integer customerId);
    // InvoiceDto getInvoiceByAppointmentId(Integer appointmentId);
    // InvoiceDto updatePaymentStatus(Integer invoiceId, String status);
    //

    InvoiceDto createInvoice(CreateInvoiceRequest request);
    InvoiceDto updateInvoice(Integer id, CreateInvoiceRequest request);
    void deleteInvoice(Integer id);
}
