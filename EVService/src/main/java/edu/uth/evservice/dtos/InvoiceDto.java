package edu.uth.evservice.dtos;

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
public class InvoiceDto {
    private Integer ticketId;
    private Integer appointmentId;
    private LocalDateTime completedTime;

    private String customerName;
    private String customerPhone;
    private String technicianName;

    private List<TicketServiceItemDto> serviceItems;
    private List<TicketPartDto> partsUsed;

    private double serviceTotal;
    private double partTotal;
    private double grandTotal;
}
