package edu.uth.evservice.EVService.requests;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerNotiRequest {
    private int customerId;
    private String title;
    private String message;
}
