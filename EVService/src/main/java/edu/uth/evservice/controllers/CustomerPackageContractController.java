package edu.uth.evservice.controllers;

import edu.uth.evservice.dtos.CustomerPackageContractDto;
import edu.uth.evservice.requests.CustomerPackageContractRequest;
import edu.uth.evservice.services.ICustomerPackageContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
// Lý do: Đảm bảo toàn bộ các API trong file này chỉ Customer mới gọi được.
public class CustomerPackageContractController {

    private final ICustomerPackageContractService contractService;

    // 1. (Create) Mua một gói dịch vụ mới
    @PostMapping
    public ResponseEntity<CustomerPackageContractDto> purchasePackage(
            @Valid @RequestBody CustomerPackageContractRequest request,Authentication authentication) {

        Integer UserId = Integer.parseInt(authentication.getName());
        CustomerPackageContractDto newContract = contractService.purchasePackage(request, UserId);
        return new ResponseEntity<>(newContract, HttpStatus.CREATED);
    }

    // 2. (Read) Lấy tất cả hợp đồng của tôi
    @GetMapping
    public ResponseEntity<List<CustomerPackageContractDto>> getMyContracts(Authentication authentication) {
        Integer UserId = Integer.parseInt(authentication.getName());
        return ResponseEntity.ok(contractService.getMyContracts(UserId));
    }

    // 3. (Read) Lấy chi tiết 1 hợp đồng
    @GetMapping("/{id}")
    public ResponseEntity<CustomerPackageContractDto> getMyContractById(@PathVariable("id") Integer id,Authentication authentication) {
        Integer UserId = Integer.parseInt(authentication.getName());
        return ResponseEntity.ok(contractService.getMyContractById(id, UserId));
    }

    // 4. (Update) Hủy một hợp đồng đang hoạt động // CẬP NHẬT CHỨ KHÔNG ĐƯỢC DỂ CUSTOMER XÓA
    @PutMapping("/{id}/cancel")
    public ResponseEntity<CustomerPackageContractDto> cancelMyContract(@PathVariable("id") Integer id,Authentication authentication) {
        Integer UserId = Integer.parseInt(authentication.getName());
        return ResponseEntity.ok(contractService.cancelMyContract(id, UserId));
    }
}