package edu.uth.evservice.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;

import edu.uth.evservice.models.enums.PaymentStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class InvoiceDto {
    private Integer id;
    private Integer ticketId;
    private Integer appointmentId;
    private LocalDateTime completedTime;

    private String customerName;
    private String customerPhone;
    private String technicianName;
    private String staffName;

    private List<TicketServiceItemDto> serviceItems;
    private List<TicketPartDto> partsUsed;

    private double serviceTotal;
    private double partTotal;
    private double grandTotal;
    private PaymentStatus paymentStatus;
}
