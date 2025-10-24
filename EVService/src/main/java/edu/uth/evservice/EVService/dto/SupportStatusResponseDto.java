package edu.uth.evservice.EVService.dto;

import lombok.Builder;
import lombok.Data;

// DTO để trả về trạng thái hỗ trợ
@Data
@Builder
public class SupportStatusResponseDto {
    private boolean isOnline;
    private String statusMessage;
}