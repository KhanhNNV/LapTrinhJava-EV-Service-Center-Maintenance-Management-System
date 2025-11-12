package edu.uth.evservice.dtos;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceTicketPartDto {
    private Integer partId;
    private String partName;
    private double unitPrice;

    // SỐ LƯỢNG GỢI Ý (cái Admin set, ví dụ cần 1 cục pin thì là 1)
    private int suggestedQuantity;

    // SỐ LƯỢNG TỒN KHO
    private int quantityInStock;
}
